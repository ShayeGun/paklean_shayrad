import env from 'dotenv'
import { Request, Response, NextFunction } from 'express'
import { User } from '../models/user'
import { createSendToken, verifyJWT } from '../utils/jwt-handler'
import { CustomError } from '../utils/custom-error'
import { catchAsync } from '../utils/catch-async'
import { userSignupValidator } from '../utils/validator-checker/user-signup-validator'

env.config({ path: `${__dirname}/../../.env` })

const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // validation of user input
    await userSignupValidator.validateAsync(req.body);

    const user = new User(req.body);
    await user.save()

    createSendToken(user, 201, res);
})

const signin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const nationalCode = req.body.nationalCode;
    const password = req.body.password;

    // 1) if there is no nationalCode or password
    if (!nationalCode || !password) {
        return next(new CustomError('please enter nationalCode and password', 401, 1001));
    }

    // 2) check if nationalCode and password are valid
    const user = await User.findOne({ nationalCode }).select('+password');

    if (!user || !(await user.correctPassword(password))) {
        return next(new CustomError('nationalCode or password is invalid 😕', 401, 1002));
    }
    // 3) if every thing was OK
    createSendToken(user, 200, res);
})

const validateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // if token exist
    let token

    if (req.cookies.jwt)
        token = req.cookies.jwt;

    if (!token) {
        return next(new CustomError('Not logged in 😒', 401, 1003));
    }

    // if token is valid
    let decode: any = await verifyJWT(token);

    // checks if user still exist
    const existedUser = await User.findById(decode.id);

    if (!existedUser) {
        return next(new CustomError('RIP good old user 💀', 401, 1004));
    }

    // // check if password was not changed
    // // changedPasswordAfter() is a model method
    // // if (existedUser.changedPasswordAfter(decode.iat)) {
    // //     return next(
    // //         new appError('dear hacker password was changed, login again honey 😘')
    // //     );
    // // }

    // grant access to protected routes
    req.user = existedUser;

    next();
})

const strictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user!.role))
            return next(new CustomError('you\'re not allowed to do this 😑', 401, 1005))
    }
}

export { signup, signin, validateUser, strictTo }