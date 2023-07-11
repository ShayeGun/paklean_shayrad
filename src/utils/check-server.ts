import { Request, Response, NextFunction } from "express";
import { GetRequest } from "./request-class/get-request";

const checkServer = async (req: Request, res: Response, next: NextFunction) => {
    const g = new GetRequest(`${process.env.BASE_URL}/GetVersion`)
    await g.call();

    next();
}

export { checkServer }