import { CustomError } from "../utils/custom-error"
import { ErrorRequestHandler, Response } from "express"
import { errorTranslator } from "../utils/error-translator";

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
        for (const [k, v] of Object.entries(err)) {
            console.log(`${k} ===> ${v}`);
        }

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

async function shayradUserIdExpired(err: any) {
    return new CustomError('user\'s userId (authentication) expired', 400, 433)
}

const errorHandler: ErrorRequestHandler = async (err, req, res, next) => {

    let error: any = err;

    if (err.code === 11000) {
        error = handleDuplicateFieldDB();
    }

    else if (error.name === 'ValidationError') {
        error = handleValidation(error);
    }

    else if (error.name === 'JsonWebTokenError') {
        error = handleJWTError();
    }

    else if (error.name === 'TokenExpiredError') {
        error = handleTokenExpired();
    }

    else if (error.name === 'AxiosError') {
        error = errorTranslator(error, [{
            errStatus: 504,
            resStatus: 411,
            msg: "please try again"
        },
        {
            errStatus: 401,
            resStatus: 500,
            msg: "please contact admins 😱"
        }])
    }

    else if (err.response?.status === 500 && err.response.data?.Message === '127:unhandled exception please call admin') {
        error = await shayradUserIdExpired(error);
    }

    sendError(error, res)
    next();

}

export { errorHandler }