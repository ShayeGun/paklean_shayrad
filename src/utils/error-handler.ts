import { CustomError } from "./errors/custom-error"
import { ErrorRequestHandler } from "express"

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof CustomError) {
        res.status(err.statusCode).json({
            errMsg: err.message
        })
    }

    else if (err._message) {
        res.status(501).send('oh no unhandled error this is end of heavens and earth 😨');
    }

    else {
        console.log(Object.keys(err.errors));
        console.error(err);

        res.status(500).send('oh no unhandled error this is end of the world 😨');
    }

}

export { errorHandler }