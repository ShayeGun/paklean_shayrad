import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catch-async";
import { GetRequest } from "../utils/request-class/get-request";
import { License } from "../models/driving-licence";
import { PostRequest } from "../utils/request-class/post-request";
import { Plate, PlateModel } from "../models/driving-plate";
import { CustomError } from "../utils/custom-error";
import { Violation } from "../models/plate-violations";

const SaveOrUpdatePlate = async (nationalCode: string, plate: Record<string, any>, plateModel: PlateModel) => {
    const data = {
        nationalCode,
        licensePlateNumber: plate.licensePlateNumber
    }
    const existedPlate = await plateModel.findOne(data);

    if (!existedPlate?.licensePlateNumber) {
        const newPlate = new plateModel({ nationalCode, ...plate });
        newPlate.save();

        return newPlate
    }
    else {
        for (let [k, v] of Object.entries(plate)) {
            if ((existedPlate as any)[k] !== v) (existedPlate as any)[k] = v;
        }

        if (existedPlate!.isModified()) await existedPlate!.save();

        return existedPlate
    }
}

export const getDrivingLicenses = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/driving-licenses`, req.token);

    const licenses = await request.call();

    let licensesArr: Record<string, any>[] = [];

    for (let license of licenses) {

        let existedLicense: any;

        if (license.nationalCode === null) {
            existedLicense = await License.findOne({
                nationalCode: req.user!.nationalCode
            })
        }
        else {
            existedLicense = await License.findOne({
                barcode: license.barcode,
                title: license.title
            })
        }

        // if the license isn't already existed in DB -> add new license
        if (!existedLicense) {
            const newLicense = new License(license);
            // for user's that don't have license (license.nationalCode = null)
            newLicense.nationalCode = req.user!.nationalCode;
            await newLicense.save();

            // update user's first and last name if its not defined -- shayrad's doing not mine sry )^,_^)
            if (req.user!.firstName === "-" || req.user!.lastName === "-") {
                // for user's that don't have license (license.firstName = null)

                req.user!.firstName = license.firstName ? license.firstName : "-";
                // for user's that don't have license (license.lastName = null)
                req.user!.lastName = license.lastName ? license.lastName : "-";

                await req.user!.save();
                licensesArr.push(newLicense);
                continue;
            }
        }

        // add national code to plates view
        license.nationalCode = req.user!.nationalCode;
        // for consistency in api
        delete license.firstName;
        delete license.lastName;
        licensesArr.push(license);
    }

    res.status(200).send(licensesArr);
})

export const getNegativePoints = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    let license = await License.findOne({
        nationalCode: req.user!.nationalCode
    })

    // FIX: OPTIONAL throw an error instead of recursive-call
    if (!license) {
        // if no license was found request to /driving-licenses end point to create licenses and don't throw any error HURRAY :D
        const licenseRequest = new PostRequest(`${req.protocol}://${req.get('host')}/api/shayrad/v1/user/driving-licenses`, req.token)

        licenseRequest.setBody({
            nationalCode: req.user!.nationalCode,
            mobile: req.user!.mobile,
            otp: req.body.otp ? req.body.otp : ''
        })

        // first element of the array cuz license barcode is one to one to the license holder
        license = (await licenseRequest.call())[0];
    }

    // show error if sb with no driving license tries to get his/her negative points
    if (!license!.barcode) return next(new CustomError("you don't have a driving license", 400, 435));

    const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/driving-licenses/${license!.printNumber}/negative-point`, req.token);

    const negPoint = await request.call();

    if (req.user!.negativePoint !== negPoint.negativePoint) {
        req.user!.negativePoint = negPoint.negativePoint
        req.user!.isDrivingAllowed = negPoint.isDrivingAllowed
        await req.user!.save();
    }

    res.status(200).send(negPoint);
})

export const getLicensePlates = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/license-plates`, req.token);
    const plates = await request.call();

    let platesArr: Record<string, any>[] = [];

    for (let plate of plates) {

        await SaveOrUpdatePlate(req.user!.nationalCode, plate, Plate);

        // add national code to plates view
        plate.nationalCode = req.user!.nationalCode;
        // only show plates in result which haven't been separated --> if (!plate.separationDate)
        platesArr.push(plate);
    }

    res.status(200).send(platesArr);
})

export const getViolationReport = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/vehicles/${req.body.licensePlate}/violations/report`, req.token);
    const violations = await request.call();

    const existedPlate = await SaveOrUpdatePlate(req.user!.nationalCode, { licensePlateNumber: req.body.licensePlate }, Plate);

    let violationsUpdated = false;

    for (let violation of violations.violations) {
        const existedViolation = await Violation.findOne({ violationId: violation.violationId });

        // violation which exist violationId != "0" and is not already saved in DB 
        if (violation.violationId !== "0" && !existedViolation) {
            const newViolation = new Violation(violation);
            await newViolation.save();

            // WARN: don't know if its good to push each violation one by one and save them or add them all together and then save them all at once ???
            existedPlate.vehicleViolations.push(newViolation._id);
            await existedPlate.save();

            violationsUpdated = true;
        }
    }

    // only change total-payment info when violations have been changed
    if (violationsUpdated) {
        let violationCopy = { ...violations }
        delete violationCopy.violations

        for (let [k, v] of Object.entries(violationCopy)) {
            existedPlate.totalViolationInfo[k] = v;
        }

        // for some who knows reasons mongoose only updates existedPlate.totalViolationInfo if we say to it manually that totalViolationInfo field have been changed so updated |-_-|
        existedPlate.markModified('totalViolationInfo');
        await existedPlate.save();
    }

    res.status(200).send(violations);
});

export const getViolationImage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const violationId = req.body.violationId ? req.body.violationId : '';
    if (!violationId) return next(new CustomError('you must proved a violation id', 400, 438));

    const plate = await SaveOrUpdatePlate(req.user!.nationalCode, { licensePlateNumber: req.body.licensePlate }, Plate);

    const existedPlate = await plate.populate({
        path: 'vehicleViolations',
        match: { violationId: violationId }
    });


    if (existedPlate?.vehicleViolations.length === 0) return next(new CustomError('this violation id doesn\'t belong to this license plate', 400, 440));

    const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/vehicles/${req.body.licensePlate}/violations/${(existedPlate?.vehicleViolations[0] as any).violationId}/image`, req.token);

    const image = await request.call();

    // save images to DB if not existed
    if (!(existedPlate?.vehicleViolations[0] as any).vehicleImage) {
        (existedPlate?.vehicleViolations[0] as any).vehicleImage = image.vehicleImage;
        (existedPlate?.vehicleViolations[0] as any).plateImage = image.plateImage;
        await (existedPlate?.vehicleViolations[0] as any).save();
    }

    res.status(200).send(existedPlate);
});

export const getViolationAggregate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/vehicles/${req.body.licensePlate}/violations/aggregate`, req.token);
    const aggregateViolations = await request.call();

    const existedPlate = await SaveOrUpdatePlate(req.user!.nationalCode, { licensePlateNumber: req.body.licensePlate }, Plate);

    if (aggregateViolations.paymentId !== existedPlate.totalViolationInfo.paymentId || aggregateViolations.complaint !== existedPlate.totalViolationInfo.complaint) {
        for (let [k, v] of Object.entries(aggregateViolations)) {
            // plateChar is already saved
            if (k === 'plateChar') continue;
            // price is number for consistency cas it to string
            if (existedPlate.totalViolationInfo[k] !== v) existedPlate.totalViolationInfo[k] = `${v}`
        }
        // for some who knows reasons mongoose only updates existedPlate.totalViolationInfo if we say to it manually that totalViolationInfo field have been changed so updated |-_-|
        existedPlate.markModified('totalViolationInfo');
        existedPlate.save();
    }

    res.status(200).send(aggregateViolations);
})

export const getPlateDoc = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const licensePlate = req.body.licensePlate ? req.body.licensePlate : '';
    if (!licensePlate) return next(new CustomError('you must proved a license plate', 400, 436));

    const existedPlate = await Plate.findOne({
        licensePlateNumber: licensePlate,
        nationalCode: req.user!.nationalCode
    });
    if (!existedPlate?.licensePlateNumber) return next(new CustomError('user doesn\'t own license plate', 400, 437));

    const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/vehicles/${existedPlate.licensePlateNumber}/documents/status`, req.token);

    const status = await request.call();

    for (let [k, v] of Object.entries(status)) {
        // plateChar is already saved
        if (k === 'plateChar') continue;
        if ((existedPlate as any)[k] !== v) (existedPlate as any)[k] = v
    }

    if (existedPlate.isModified()) await existedPlate.save();

    res.status(200).send(status);
});