import { CustomError } from "./custom-error";
import { NextFunction } from "express";


export const errorTranslator = (err: any, errStatus: number, msg: string = 'error', resStatus: number = 400, next: NextFunction) => {
    const validErrName = err.name === "AxiosError" ? true : false;

    const e = err.message.split(" ");
    const status = Number(e[e.length - 1]);

    const validErrStatus = status === errStatus ? true : false;

    if (validErrName && validErrStatus)
        return next(new CustomError(msg, errStatus, resStatus));

    return
} 