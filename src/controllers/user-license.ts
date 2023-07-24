import { NextFunction, Request, Response } from "express";
import { PostRequest } from "../utils/request-class/post-request";
import { catchAsync } from "../utils/catch-async";
import { errorTranslator } from "../utils/error-translator";
import { CustomError } from "../utils/custom-error";
import { GetRequest } from "../utils/request-class/get-request";
import { License } from "../models/driving-licence";
import { User } from "../models/user";

export const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { mobile, nationalCode } = req.body

        const request = new PostRequest(`${process.env.SERVER_ADDRESS}/naji/users/initial-register`);

        request.setHeader({ "Authorization": `${req.token.tokenType} ${req.token.accessToken}`, "Content-Type": "application/json" }).setBody({
            nationalCode,
            mobile
        })

        // const response = await request.call()

        // if (response.status === 200) {
        //     const userData = {
        //         nationalCode,
        //         mobile,
        //         firstName: response.data.firstName,
        //         lastName: response.data.lastName,
        //         userId: response.data.userId

        //     }
        //     const user = new User(userData);

        //     await user.save();
        // }

        res.json('response.data');

    } catch (err: any) {
        errorTranslator(err, 400, 'national-code | phone-number | opt', 429, next);
        errorTranslator(err, 404, 'user must own the phone number', 430, next)
        next(err);
    }



    // try {
    //     const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/12cv3/license-plates`);

    //     request.setHeader({ "Authorization": `${req.token.tokenType} ${req.token.accessToken}`, "Content-Type": "application/json" });

    //     const response = await request.call();

    //     console.log(response);

    //     // Null
    //     res.send('😁');
    // }
    // catch (err) {
    //     console.log('this is an error');

    // }

})

// export const registerUser = catchAsync(
//     async (req: Request, res: Response, next: NextFunction) => {
//         const { mobile, nationalCode } = req.user as any
//         const otp = req.body.opt

//         // FIX: maybe validate otp
//         if (!otp) throw new CustomError('needs an otp', 400, 1007)

//         const request = new PostRequest(`${process.env.SERVER_ADDRESS}/naji/users`);
//         request.setBody({
//             nationalCode,
//             mobile,
//             otp
//         })
//         const response = await request.call()

//         // Null
//         res.send(response)
//     }
// )

// export const getLicenses = catchAsync(
//     async (req: Request, res: Response, next: NextFunction) => {

//         const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/user/${req.user!.id}/driving-licenses`)

//         const licenses = await request.call();

//         for (let license of licenses) {
//             const l = new License(license);
//             await l.save();

//             await User.findByIdAndUpdate(req.user!.id, { drivingLicenses: [...req.user!.drivingLicenses, l] })
//         }
//     }
// )