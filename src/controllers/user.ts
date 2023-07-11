import { Request, Response } from "express";
import { PostRequest } from "../utils/request-class/post-request";

const registerUser = async (req: Request, res: Response) => {
    const { mobile, nationalCode } = req.body
    const request = new PostRequest(`${process.env.SERVER_ADDRESS}/naji/users/initial-register`);
    request.body({
        nationalCode,
        mobile
    })
    const response = await request.call()

    // Null
    res.send(response)
}

const loginUser = async (req: Request, res: Response) => {
    const { mobile, nationalCode } = req.body
    const request = new PostRequest(`${process.env.SERVER_ADDRESS}/naji/users`);
    request.body({
        nationalCode,
        mobile
    })
    const response = await request.call()

    // userId, firstName, lastName
    res.send(response)
}

export { registerUser, loginUser }