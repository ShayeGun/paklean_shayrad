import env from 'dotenv'
import { Request, Response, NextFunction } from 'express'
import { User } from '../models/user'
import { createSendToken } from '../utils/jwt/jwt'
import { AuthError } from '../errors/authorize-error'

env.config({ path: `${__dirname}/../../.env` })

const signup = async (req: Request, res: Response, next: NextFunction) => {
    const user = new User(req.body);
    await user.save()

    createSendToken(user, 201, res);
}

const signin = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email;
    const password = req.body.password;

    // 1) if there is no email or password
    if (!email || !password) {
        return next(new AuthError('please enter email and password'));
    }

    // 2) check if email and password are valid
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password))) {
        return next(new AuthError('email or password is invalid 😕'));
    }
    // 3) if every thing was OK
    createSendToken(user, 200, res);
};

export { signup, signin }