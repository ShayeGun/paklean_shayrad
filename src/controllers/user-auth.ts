import env from 'dotenv'
import { Request, Response, NextFunction } from 'express'
import { User } from '../models/user'
import { createSendToken, verifyJWT } from '../utils/jwt/jwt'
import { AuthError } from '../utils/errors/authorize-error'
import { JwtPayload } from 'jsonwebtoken'

env.config({ path: `${__dirname}/../../.env` })

const signup = async (req: Request, res: Response, next: NextFunction) => {
    const user = new User(req.body);
    await user.save()

    createSendToken(user, 201, res);
}

const signin = async (req: Request, res: Response, next: NextFunction) => {
    const nationalCode = req.body.nationalCode;
    const password = req.body.password;

    // 1) if there is no nationalCode or password
    if (!nationalCode || !password) {
        return next(new AuthError('please enter nationalCode and password'));
    }

    // 2) check if nationalCode and password are valid
    const user = await User.findOne({ nationalCode }).select('+password');

    if (!user || !(await user.correctPassword(password))) {
        return next(new AuthError('nationalCode or password is invalid 😕'));
    }
    // 3) if every thing was OK
    createSendToken(user, 200, res);
};

const validateUser = async (req: Request, res: Response, next: NextFunction) => {
    // if token exist
    let token

    if (req.cookies.jwt)
        token = req.cookies.jwt;

    if (!token) {
        return next(new AuthError('Not logged in 😒'));
    }

    // if token is valid
    let decode: any = await verifyJWT(token);

    // checks if user still exist
    const existedUser = await User.findById(decode.id);

    if (!existedUser) {
        return next(new AuthError('RIP good old user 💀'));
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
}

const strictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user!.role))
            return next(new AuthError('you\'re not allowed to do this 😑'))
    }
}

export { signup, signin, validateUser, strictTo }