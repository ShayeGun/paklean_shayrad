import { Router } from "express";
import { catchAsync } from "../utils/catch-async";
import { signup, signin, validateUser } from "../controllers/user-auth";

const router = Router();

// router.route('/register')
//     .post(catchAsync(registerUser))

router.route('/signup')
    .post(catchAsync(signup))

router.route('/signin')
    .post(catchAsync(signin))

router.route('/hello')
    .get(catchAsync(validateUser), async (req, res) => {

        res.status(200).send(req.user)

    })

export { router as userRoute }