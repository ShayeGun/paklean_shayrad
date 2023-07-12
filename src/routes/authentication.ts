import { Router } from "express";
import { catchAsync } from "../utils/catch-async";
import { registerUser, loginUser } from "../controllers/user";
import { authentication } from "../controllers/auth/auth";
import { User } from "../models/user";

const router = Router();

router.route('/register')
    .post(catchAsync(registerUser))

router.route('/login')
    .post(catchAsync(loginUser))

router.route('/signup')
    .post(catchAsync(authentication))

router.route('/hello')
    .all(async (req, res) => {
        res.send('hello baby 😉')
    })

export { router as authRoute }