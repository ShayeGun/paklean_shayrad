import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/customError";

export const catchAsync = <T extends (req: Request, res: Response, next: NextFunction) => Promise<any>>(func: T) => {
    return (req: Request, res: Response, next: NextFunction) => {
        func(req, res, next).catch((err: CustomError) => next(err));
    };
}