import { Router } from "express";
import { validateUser } from "../controllers/user-auth";
import { registerUser } from "../controllers/user-license";
import { userSignupValidator } from "../utils/validator-checker/user-signup-validator";

const router = Router();

// router.route('signup')
// .post()

router.route('/register')
    .post(validateUser, registerUser)

// router.route('/user-license').get(validateUser, getLicenses)

router.route('/hello')
    .get(validateUser, async (req, res) => {

        res.status(200).send(req.user)

    })

export { router as userRoute }