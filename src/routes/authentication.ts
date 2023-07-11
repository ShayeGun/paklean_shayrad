import { Router } from "express";
import { catchAsync } from "../utils/catch-async";
import { registerUser, loginUser } from "../controllers/user";
import { authentication } from "../controllers/auth";

const router = Router();

router.route('/register')
    .post(catchAsync(registerUser))

router.route('/login')
    .post(catchAsync(loginUser))

router.route('/signup')
    .post(catchAsync(authentication))

export { router as authRoute }