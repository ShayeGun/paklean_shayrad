import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catch-async";
import { GetRequest } from "../utils/request-class/get-request";
import { License } from "../models/driving-licence";
import { Plate } from "../models/driving-plate";
import { Violation } from "../models/plate-violations";
import { Passport } from "../models/passport";
import { errorTranslator } from "../utils/error-translator";
import { User } from "../models/user";
import { SaveOrUpdateModel } from "../utils/save-or-update-model";

export const getDrivingLicenses = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/driving-licenses`, req.token);
    const licenses = await request.call();

    let licensesArr: Record<string, any>[] = [];

    for (let license of licenses) {

        const nationalCode = req.body.nationalCode;
        const title = license.title;
        const printNumber = license.printNumber;

        await SaveOrUpdateModel({ nationalCode, title, printNumber }, license, License);

        // let existedLicense: any;

        // if (license.nationalCode === null) {
        //     existedLicense = await License.findOne({
        //         nationalCode: req.user!.nationalCode
        //     });
        // }
        // else {
        //     existedLicense = await License.findOne({
        //         barcode: license.barcode,
        //         title: license.title
        //     });
        // }

        // // if the license isn't already existed in DB -> add new license
        // if (!existedLicense) {
        //     const newLicense = new License(license);
        //     // for user's that don't have license (license.nationalCode = null)
        //     newLicense.nationalCode = req.user!.nationalCode;
        //     await newLicense.save();

        //     // update user's first and last name if its not defined -- shayrad's doing not mine sry )^,_^)
        //     if (req.user!.firstName === "-" || req.user!.lastName === "-") {
        //         // for user's that don't have license (license.firstName = null)

        //         req.user!.firstName = license.firstName ? license.firstName : "-";
        //         // for user's that don't have license (license.lastName = null)
        //         req.user!.lastName = license.lastName ? license.lastName : "-";

        //         await req.user!.save();
        //         licensesArr.push(newLicense);
        //         continue;
        //     }
        // }

        // // add national code to plates view
        // license.nationalCode = req.user!.nationalCode;
        // // for consistency in api
        // delete license.firstName;
        // delete license.lastName;
        // licensesArr.push(license);
    }

    res.status(200).send(licensesArr);
});

export const getNegativePoints = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/driving-licenses/${req.body.drivingLicense}/negative-point`, req.token);
        const negPoint = await request.call();

        const nationalCode = req.body.nationalCode;

        await SaveOrUpdateModel({ nationalCode }, negPoint, User);

        res.status(200).json(negPoint);
    } catch (err) {
        return next(errorTranslator(err, [{
            errStatus: 400,
            resStatus: 449,
            msg: 'user doesn\'t own the driving license'
        }]));
    }

});

export const getLicensePlates = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/license-plates`, req.token);
    const plates = await request.call();

    let platesArr: Record<string, any>[] = [];

    for (let plate of plates) {

        const nationalCode = req.user!.nationalCode;
        const licensePlateNumber = plate.licensePlateNumber;
        const existedPlate = await SaveOrUpdateModel({ nationalCode, licensePlateNumber }, plate, Plate);

        // add national code to plates view
        plate.nationalCode = req.user!.nationalCode;
        // add formatted plate to response + vehicle type
        plate.formattedPlate = existedPlate.formattedPlate;
        plate.vehicleType = existedPlate.vehicleType;
        // only show plates in result which haven't been separated --> if (!plate.separationDate)
        platesArr.push(plate);
    }

    res.status(200).json(platesArr);
});

export const getViolationReport = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/vehicles/${req.body.licensePlate}/violations/report`, req.token);
        const violations = await request.call();
        const nationalCode = req.user!.nationalCode;
        const licensePlateNumber = req.body.licensePlate;

        const existedPlate = await SaveOrUpdateModel({ nationalCode, licensePlateNumber }, { licensePlateNumber }, Plate);

        let violationsUpdated = false;

        for (let violation of violations.violations) {
            const existedViolation = await Violation.findOne({ violationId: violation.violationId });

            // violation which exist violationId != "0" and is not already saved in DB 
            if (violation.violationId !== "0" && !existedViolation) {
                const newViolation = new Violation({ ...violation, licensePlateNumber });
                await newViolation.save();

                // WARN: don't know if its good to push each violation one by one and save them or add them all together and then save them all at once ???
                existedPlate.vehicleViolations.push(newViolation._id);
                await existedPlate.save();

                violationsUpdated = true;
            }
        }

        // only change total-payment info when violations have been changed
        if (violationsUpdated) {
            let violationCopy = { ...violations };
            delete violationCopy.violations;

            for (let [k, v] of Object.entries(violationCopy)) {
                existedPlate.totalViolationInfo[k] = v;
            }

            // for some who knows reasons mongoose only updates existedPlate.totalViolationInfo if we say to it manually that totalViolationInfo field have been changed so updated |-_-|
            existedPlate.markModified('totalViolationInfo');
            await existedPlate.save();
        }

        res.status(200).json(violations);
    } catch (err) {
        return next(errorTranslator(err, [{
            errStatus: 400,
            resStatus: 440,
            msg: 'user doesn\'t own the license plate'
        }]));
    }
});

export const getViolationImage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const licensePlateNumber = req.body.licensePlate;
        const violationId = req.body.violationId;

        const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/vehicles/${licensePlateNumber}/violations/${violationId}/image`, req.token);
        const image = await request.call();

        await SaveOrUpdateModel({ violationId }, image, Violation);

        res.status(200).json(image);
    } catch (err) {
        return next(errorTranslator(err, [{
            errStatus: 400,
            resStatus: 441,
            msg: 'user doesn\'t own the license plate OR violation id is invalid'
        },
        {
            errStatus: 500,
            resStatus: 450,
            msg: 'violation id is not for specified license plate '
        }]));
    }
});

export const getViolationAggregate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const nationalCode = req.user!.nationalCode;
    const licensePlateNumber = req.body.licensePlate;

    const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/vehicles/${licensePlateNumber}/violations/aggregate`, req.token);
    const aggregateViolations = await request.call();

    // format data to be consistent
    const formattedData: Record<string, any> = {};
    for (let [k, v] of Object.entries(aggregateViolations)) {
        if (k === 'price') {
            formattedData[k] = String(v);
            continue;
        }
        formattedData[k] = v;
    };

    const d = await SaveOrUpdateModel({ nationalCode, licensePlateNumber }, { totalViolationInfo: formattedData }, Plate);

    res.status(200).json(d);
});

export const getPlateDoc = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const nationalCode = req.user!.nationalCode;
        const licensePlateNumber = req.body.licensePlate;

        const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/vehicles/${licensePlateNumber}/documents/status`, req.token);
        const status = await request.call();

        await SaveOrUpdateModel({ nationalCode, licensePlateNumber }, status, Plate);

        res.status(200).json(status);
    } catch (err) {
        return next(errorTranslator(err, [{
            errStatus: 500,
            resStatus: 440,
            msg: 'user doesn\'t own the license plate'
        }]));
    }
});

export const getPassport = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/passport/status`, req.token);
    const passport = await request.call();

    const nationalCode = req.user!.nationalCode;
    const passportNo = passport.passportNo;

    // WARN: check if passportNo is unique or poetBarcode for each passport ???
    await SaveOrUpdateModel({ nationalCode, passportNo }, passport, Passport);

    res.status(200).json(passport);
});