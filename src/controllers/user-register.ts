import { NextFunction, Request, Response } from "express";
import { PostRequest } from "../utils/request-class/post-request";
import { catchAsync } from "../utils/catch-async";

const preRegisterUser = catchAsync(async (req: Request, res: Response) => {

    const { mobile, nationalCode } = req.user as any
    const request = new PostRequest(`${process.env.SERVER_ADDRESS}/naji/users/initial-register`);
    request.setBody({
        nationalCode,
        mobile
    })
    await request.call()

    // Null
    res.send()
})

const registerUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { mobile, nationalCode } = req.user as any
        const otp = req.body.opt

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

export { preRegisterUser, registerUser }