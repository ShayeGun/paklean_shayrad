import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catch-async";
import { violationValidator } from "../utils/validator-checker/violation-validator";

export const checkViolation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const violationId = req.body.violationId;

    const validate = await violationValidator.validateAsync({ violationId });

    if (!validate) return next(validate);

    next();
});