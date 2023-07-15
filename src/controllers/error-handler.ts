import { CustomError } from "../utils/custom-error"
import { ErrorRequestHandler, Response } from "express"

const sendError = (err: CustomError | Error, res: Response) => {
    if (err instanceof CustomError) {
        res.status(err.errStatus());
        res.json(err.errInfo());
    }
    else {
        console.log(err);

        res.status(500).send('oh oh sth bad happened 😓')

    }
}

function handleDuplicateFieldDB() {
    return new CustomError('Duplication of data', 400, 1001)
}

function handleValidation(err: any) {
    // const errorSubject = err
    console.log(Object.keys(err.errors));

    return new CustomError(`${err._message}: ${Object.keys(err.errors)}`, 400, 1001)
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


    if (error._message === 'User validation failed') {
        error = handleValidation(err);
    }

    if (error.name === 'JsonWebTokenError') {
        error = handleJWTError();
    }

    if (error.name === 'TokenExpiredError') {
        error = handleTokenExpired();
    }

    sendError(error, res)
    next();

}

export { errorHandler }