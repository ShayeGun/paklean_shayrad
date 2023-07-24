import { Request, Response, NextFunction } from 'express'
import { CustomError } from '../utils/custom-error'
import { catchAsync } from '../utils/catch-async'
import { GetRequest } from '../utils/request-class/get-request'
import { userSignupValidator } from '../utils/validator-checker/user-signup-validator'
import { User } from '../models/user'

const validateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { mobile, nationalCode } = req.body;
    const otp = req.body.otp ? req.body.otp : '';

    // request wasn't valid
    await userSignupValidator.validateAsync({ mobile, nationalCode, otp });

    const user = await User.findOne({
        nationalCode,
        mobile
    })

    // no user found
    if (!user) return next(new CustomError('no such user exist', 400, 400));

    console.log(user);

    // FIX: make register function
    // case 1 > user has no shayrad userId and no otp
    if (!user.userId && otp) {
        // 
        return next(new CustomError('need an otp', 400, 400));
    }

    // case 2 > user has no shayrad userId but has otp
    // if (!user.userId && otp) return next(new CustomError('need an otp', 400, 400));


    // const request = new GetRequest()
    next();
})

const strictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user!.role))
            return next(new CustomError('you\'re not allowed to do this 😑', 401, 1005))
    }
}

export { validateUser, strictTo }