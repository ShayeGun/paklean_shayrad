import { CustomError } from "../errors/customError"
import { ErrorRequestHandler } from "express"

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof CustomError) {
        res.status(err.statusCode).json({
            errMsg: err.message
        })
    }
    else {
        console.error(err);
        res.status(500);
    }
}

export { errorHandler }