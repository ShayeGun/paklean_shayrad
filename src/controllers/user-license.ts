import { NextFunction, Request, Response } from "express";
import { PostRequest } from "../utils/request-class/post-request";
import { catchAsync } from "../utils/catch-async";
import { CustomError } from "../utils/custom-error";
import { GetRequest } from "../utils/request-class/get-request";
import { License } from "../models/driving-licence";
import { User } from "../models/user";

export const preRegisterUser = catchAsync(async (req: Request, res: Response) => {

    // const { phone, nationalCode } = req.user as any
    const request = new PostRequest(`${process.env.SERVER_ADDRESS}/naji/users/initial-register`);
    // request.setBody({
    //     nationalCode,
    //     mobile: phone
    // }).setHeader({ "Authorization": `${req.token.tokenType} ${req.token.accessToken}` })
    await request.call()

    // Null
    res.send('ok')
})

export const registerUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { mobile, nationalCode } = req.user as any
        const otp = req.body.opt

        // FIX: maybe validate otp
        if (!otp) throw new CustomError('needs an otp', 400, 1007)

        const request = new PostRequest(`${process.env.SERVER_ADDRESS}/naji/users`);
        request.setBody({
            nationalCode,
            mobile,
            otp
        })
        const response = await request.call()

        // Null
        res.send(response)
    }
)

export const getLicenses = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {

        const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/user/${req.user!.id}/driving-licenses`)

        const licenses = await request.call();

        for (let license of licenses) {
            const l = new License(license);
            await l.save();

            await User.findByIdAndUpdate(req.user!.id, { drivingLicenses: [...req.user!.drivingLicenses, l] })
        }
    }
)