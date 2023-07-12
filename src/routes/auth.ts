import { Router } from "express";
import { catchAsync } from "../utils/catch-async";
import { registerUser, loginUser } from "../controllers/user";
import { signup, signin } from "../controllers/auth";
import { User } from "../models/user";

const router = Router();

router.route('/register')
    .post(catchAsync(registerUser))

router.route('/signin')
    .post(catchAsync(signin))

router.route('/signup')
    .post(catchAsync(signup))

router.route('/hello')
    .all(async (req, res) => {
        res.send('hello baby 😉')
    })

export { router as authRoute }