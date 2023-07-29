import { Request, Response, NextFunction, response } from 'express'
import { CustomError } from '../utils/custom-error'
import { catchAsync } from '../utils/catch-async'
import { errorTranslator } from "../utils/error-translator";
import { PostRequest } from "../utils/request-class/post-request";
import { userSignupValidator } from '../utils/validator-checker/user-signup-validator'
import { User } from '../models/user'

const preRegisterUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { mobile, nationalCode } = req.body

        const request = new PostRequest(`${process.env.SERVER_ADDRESS}/naji/users/initial-register`, req.token);

        request.setBody({
            nationalCode,
            mobile
        })

        const response = await request.call();

        return response

    } catch (err: any) {
        return next(errorTranslator(err, [{
            errStatus: 400,
            resStatus: 428,
            msg: 'need correct national code OR mobile number'
        },
        {
            errStatus: 404,
            resStatus: 430,
            msg: 'user must own mobile number'
        }]));
    }
}

const registerUser = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { mobile, nationalCode, otp } = req.body

        const request = new PostRequest(`${process.env.SERVER_ADDRESS}/naji/users`, req.token);

        request.setBody({
            nationalCode,
            mobile,
            otp
        })

        const response = await request.call()

        const userData = {
            nationalCode,
            mobile,
            firstName: response.firstName,
            lastName: response.lastName,
            userId: response.userId

        }

        const existedUser = await User.findOne({
            nationalCode,
            mobile
        })

        // case 1 -> user doesn't exist -> create new user
        if (!existedUser) {
            const user = new User(userData);
            await user.save();
            req.user = user;
        }
        // case 2 -> user already exists -> update userId
        else {
            existedUser.userId = response.userId;
            await existedUser.save();
            req.user = existedUser;
        }

        return response

    } catch (err: any) {
        return next(errorTranslator(err, [{
            errStatus: 400,
            resStatus: 429,
            msg: 'need correct national code OR mobile number OR otp is invalid'
        },
        {
            errStatus: 404,
            resStatus: 430,
            msg: 'user must own mobile number'
        }]));
    }

}

const validateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { mobile, nationalCode } = req.body;
    const otp = req.body.otp ? req.body.otp : '';

    // request wasn't valid
    await userSignupValidator.validateAsync({ mobile, nationalCode, otp });

    const user = await User.findOne({
        nationalCode,
        mobile
    })

    // <not signed users> no user found
    if (!user?.userId && !otp) {
        const response = await preRegisterUser(req, res, next);

        if (!response) {
            return next(new CustomError('needs and otp', 401, 431));
        }

        return next(response);
    }

    // <not signed users> no user found
    else if (!user?.userId && otp) {
        const response = await registerUser(req, res, next);

        if (!response.status) {
            return next();
        }

        return next(response);
    }
    // user already exist
    req.user = user!;
    next();
})

const strictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user!.role))
            return next(new CustomError('you\'re not allowed to do this 😑', 401, 1005))
    }
}

export { validateUser, strictTo }