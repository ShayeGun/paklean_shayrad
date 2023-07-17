import { CustomError } from "../utils/custom-error"
import { ErrorRequestHandler, Response } from "express"

const sendError = (err: CustomError | Error, res: Response) => {
    if (err instanceof CustomError) {
        res.status(err.errStatus());
        res.json(err.errInfo());
    }
    else {
        console.log(err);
        console.log(Object.keys(err));

        res.status(500).send('oh oh sth bad happened 😓')

    }
}

function handleDuplicateFieldDB() {
    return new CustomError('Duplication of data', 400, 1101)
}

function handleValidation(err: any) {
    return new CustomError(`${err._message}: ${Object.keys(err.errors)}`, 400, 1102)
}

function handleJWTError() {
    return new CustomError('invalid token Please login!', 401, 1201);
}

function handleTokenExpired() {
    return new CustomError('token expired Please login again!', 401, 1202);
}

function handleAxiosError(err: any) {
    console.log(err.name);
    console.log(err.message);

    // get error status code in axios err message and turn in into number
    const array: string[] = (err.message as string).split(' ')

    const errStatus = +array[array.length - 1]

    return new CustomError(`${err.name}: ${err.code}`, errStatus, 2001)
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

    if (error.name === 'AxiosError') {
        error = handleAxiosError(err);
    }

    sendError(error, res)
    next();

}

export { errorHandler }