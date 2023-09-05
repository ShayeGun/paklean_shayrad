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
import { CustomError } from "../utils/custom-error";
import { userSignupValidator } from "../utils/validator-checker/user-signup-validator";

const selectNeededFields = (object: any, selectionFields: string[]) => {
    const dCopy: Record<string, any> = {};

    for (let [k, v] of Object.entries(object._doc)) {
        if (selectionFields.includes(k)) dCopy[k] = v;
    }

    return dCopy;
};

//========================================================
// post routes business logics <get data from naja>
//========================================================

export const getDrivingLicenses = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/driving-licenses`, req.token);
    const licenses = await request.call();

    for (let license of licenses) {

        const nationalCode = req.body.nationalCode;
        const title = license.title;
        const printNumber = license.printNumber;

        await SaveOrUpdateModel({ nationalCode, title, printNumber }, license, License);

        await SaveOrUpdateModel({ userId: req.user!.userId }, { firstName: license.firstName, lastName: license.lastName }, User);
    }

    res.status(200).send(licenses);
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

        // clear previous violation active records in DB
        let newViolations = [];

        for (let violation of violations.violations) {

            const existedViolation = await SaveOrUpdateModel({ violationId: violation.violationId }, { ...violation, licensePlateNumber }, Violation);
            newViolations.push(existedViolation._id);
        }

        const { violations: _, ...totalViolationInfo } = violations;
        existedPlate.totalViolationInfo = totalViolationInfo;
        existedPlate.vehicleViolations = newViolations;

        // for some who knows reasons mongoose only updates existedPlate.totalViolationInfo if we say to it manually that totalViolationInfo field have been changed so updated |-_-|
        existedPlate.markModified('totalViolationInfo');
        existedPlate.markModified('vehicleViolations');
        await existedPlate.save();

        const selectionFields = ["vehicleType", "formattedPlate"];
        const plateData = selectNeededFields(existedPlate, selectionFields);

        res.status(200).json({ ...violations, ...plateData });
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

        const existedViolation = await SaveOrUpdateModel({ violationId }, {}, Violation);

        if (!existedViolation.hasImage) throw new CustomError('violation doesn\'t have an image', 400, 467);

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

    const selectionFields = ["nationalCode", "licensePlateNumber", "totalViolationInfo", "vehicleType", "formattedPlate"];
    const dCopy = selectNeededFields(d, selectionFields);

    res.status(200).json(dCopy);
});

export const getPlateDoc = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const nationalCode = req.user!.nationalCode;
        const licensePlateNumber = req.body.licensePlate;

        const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/vehicles/${licensePlateNumber}/documents/status`, req.token);
        const status = await request.call();

        await SaveOrUpdateModel({ nationalCode, licensePlateNumber }, { docs: status }, Plate);

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


//========================================================
// get routes business logics <fetch data from local DB>
//========================================================

const mongooseFormatter = (obj: any, addData: any, removeData: string[] = ["_id", "__v"]) => {
    let copyLicense: any = obj._doc;

    for (let [k, v] of Object.entries(addData)) {
        copyLicense[k] = v;
    }

    for (let r of removeData) {
        delete copyLicense[r];
    }

    return copyLicense;
};

export const fetchPlates = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { nationalCode, mobile } = req.params;

    await userSignupValidator.validateAsync({ mobile, nationalCode });

    const existedUser = await User.findOne({ nationalCode, mobile });

    const firstName = existedUser!.firstName,
        lastName = existedUser!.lastName;


    if (!existedUser) throw new CustomError('no such user exists', 400, 400);

    const selectionFields = "serial licensePlateNumber description separationDate licensePlate nationalCode vehicleType formattedPlate";

    const plates = await Plate.find({ nationalCode }).select(selectionFields);

    res.status(200).json({ plates, firstName, lastName });
});

export const fetchLicenses = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { nationalCode, mobile } = req.params;

    await userSignupValidator.validateAsync({ mobile, nationalCode });

    const existedUser = await User.findOne({ nationalCode, mobile });

    const firstName = existedUser!.firstName,
        lastName = existedUser!.lastName;

    if (!existedUser) throw new CustomError('no such user exists', 400, 400);

    const licenses = await License.find({ nationalCode });

    const formattedLicenses = [];
    for (let license of licenses) {
        const copyLicense = mongooseFormatter(license, { firstName, lastName });
        formattedLicenses.push(copyLicense);
    }

    res.status(200).json(formattedLicenses);
});