import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catch-async";
import { GetRequest } from "../utils/request-class/get-request";
import { Passport } from "../models/passport";

export const getPassport = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/passport/status`, req.token);

    const passport = await request.call();

    let existedPassport: any;

    if (passport.hasPassport === false) {
        existedPassport = await Passport.findOne({
            nationalCode: req.user!.nationalCode
        });
    }
    else {
        // WARN: check if passportNo is unique or poetBarcode ???
        existedPassport = await Passport.findOne({
            passportNo: passport.passportNo
        })
    }

    // if the passport isn't already existed in DB -> add new plate
    if (!existedPassport) {
        const newPassport = new Passport(passport);
        newPassport.nationalCode = req.user!.nationalCode;
        await newPassport.save();
    }

    // add national code to passport view
    passport.nationalCode = req.user!.nationalCode;

    res.status(200).send(passport);
})