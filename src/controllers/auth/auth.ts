import env from 'dotenv'
import { Request, Response, NextFunction } from 'express'
import { User } from '../../models/user'
import { generateJWT } from './create-jwt'

env.config({ path: `${__dirname}/../../.env` })

const authentication = async (req: Request, res: Response, next: NextFunction) => {
    const user = new User(req.body);
    await user.save()

    const accessToken = generateJWT({});

    res.status(201).send(user)
}

export { authentication }