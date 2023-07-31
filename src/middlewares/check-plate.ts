import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catch-async";
import { plateValidator } from "../utils/validator-checker/license-plate-validator";

export const checkPlate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const licensePlate = req.body.licensePlate;
    console.log('licensePlate: ', licensePlate);

    const validate = await plateValidator.validateAsync({ licensePlate });

    if (!validate) return next(validate);

    next();
})