import jwt from 'jsonwebtoken';

const generateJWT = async (data: Record<string, any>) => {
    const token = jwt.sign(data, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXP
    });

    return token
}

const verifyJWT = async (token: string) => {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET!)

    return decodedData
}

export { generateJWT, verifyJWT }