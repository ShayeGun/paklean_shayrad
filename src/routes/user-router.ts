import { Router } from "express";
import { validateUser } from "../controllers/user-auth";

const router = Router();

router.route('/register')
    .post(validateUser, (req, res, next) => {
        res.status(200).send('ok')
    })

// router.route('/user-license').get(validateUser, getLicenses)

router.route('/hello')
    .get(validateUser, async (req, res) => {

        res.status(200).send(req.user)

    })

export { router as userRoute }