import { Response } from 'express';
import jwt from 'jsonwebtoken';

interface ICookie {
    httpOnly: boolean,
    expires: Date,
    secure?: boolean
}

function createSendToken(user: Record<string, any>, statusCode: number, res: Response) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRES_AT,
    });

    const cookiesOpt: ICookie = {
        httpOnly: true,
        expires: new Date(Date.now() + Number(process.env.JWT_EXPIRES_AT!)),
    };
    // only in production use HTTPs
    // if (process.env.NODE_ENV === 'production') cookiesOpt.secure = true;

    // creating a cookie
    res.cookie('jwt', token, cookiesOpt);

    // not showing password in response
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        user: user,
    });
}

const verifyJWT = async (token: string) => {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET!)

    return decodedData
}

export { createSendToken, verifyJWT }