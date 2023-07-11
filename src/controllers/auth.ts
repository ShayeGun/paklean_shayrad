import jwt from 'jsonwebtoken'
import env from 'dotenv'
import { Request, Response, NextFunction } from 'express'
import { User } from '../models/user'

env.config({ path: `${__dirname}/../../.env` })

const authentication = async (req: Request, res: Response, next: NextFunction) => {
    const user = new User(req.body);
    user.save()
    next()
}

export { authentication }