import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catch-async";
import { licenseValidator } from "../utils/validator-checker/driving-license-validator";

export const checkLicense = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const drivingLicense = req.body.drivingLicense;

    const validate = await licenseValidator.validateAsync({ drivingLicense });

    if (!validate) return next(validate);

    next();
});