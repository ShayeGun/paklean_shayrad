import { CustomError } from "../utils/custom-error"
import { ErrorRequestHandler, Response } from "express"

const sendError = (err: CustomError | Error, res: Response) => {
    if (err instanceof CustomError && err.errInfo().status === 'fail') {
        res.status(err.errStatus());
        res.json(err.errInfo());
    }
    else {
        // unwanted data
        delete (err as any).request;
        delete (err as any).response;
        delete (err as any).config;

        console.log(Object.keys(err));
        console.log(err);

        res.status(500).send('oh oh sth bad happened 😓')

    }
}

function handleDuplicateFieldDB() {
    return new CustomError('Duplication of data', 400, 1101)
}

function handleValidation(err: any) {
    // mongoose validation error (database-side)
    if (err._message)
        return new CustomError(`${err._message}: ${Object.keys(err.errors)}`, 400, 1102)

    // joi validation error (server-side)
    else if (typeof (err._original) === 'object')
        return new CustomError(err.message, 400, 1103)
}

function handleJWTError() {
    return new CustomError('invalid token Please login!', 401, 1201);
}

function handleTokenExpired() {
    return new CustomError('token expired Please login again!', 401, 1202);
}

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {

    let error: any = err;

    if (err.code === 11000) {
        error = handleDuplicateFieldDB();
    }

    else if (error.name === 'ValidationError') {
        error = handleValidation(err);
    }

    else if (error.name === 'JsonWebTokenError') {
        error = handleJWTError();
    }

    else if (error.name === 'TokenExpiredError') {
        error = handleTokenExpired();
    }

    sendError(error, res)
    next();

}

export { errorHandler }