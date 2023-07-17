import { Router } from "express";
import { catchAsync } from "../utils/catch-async";
import { signup, signin, validateUser } from "../controllers/user-auth";
import { preRegisterUser, registerUser } from "../controllers/user-register";

const router = Router();

router.route('/signup')
    .post(signup)

router.route('/signin')
    .post(signin)

router.use(validateUser)

router.route('/pre-register')
    .post(preRegisterUser)

router.route('/register')
    .post(registerUser)

router.route('/hello')
    .get(async (req, res) => {

        res.status(200).send(req.user)

    })

export { router as userRoute }