import { Request, Response, NextFunction } from "express"

const makeMiddleware = <T extends () => Promise<any>>(func: T) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        await func();

        return next()
    }
}

export { makeMiddleware }