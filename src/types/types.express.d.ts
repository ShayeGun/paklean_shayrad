// extend Request object fields for Express
declare namespace Express {
    export interface Request {
        user?: Record<string, any>,
        token?: any

    }
}
