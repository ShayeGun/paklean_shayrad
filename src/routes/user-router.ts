import { Router } from "express";
import { catchAsync } from "../utils/catch-async";
import { signup, signin, validateUser } from "../controllers/user-auth";
import { preRegisterUser, registerUser, getLicenses } from "../controllers/user-license";

const router = Router();

router.route('/signup')
    .post(signup)

router.route('/signin')
    .post(signin)

router.route('/pre-register')
    .post(validateUser, preRegisterUser)

router.route('/register')
    .post(validateUser, registerUser)

router.route('/user-license').get(validateUser, getLicenses)

router.route('/hello')
    .get(validateUser, async (req, res) => {

        res.status(200).send(req.user)

    })

export { router as userRoute }