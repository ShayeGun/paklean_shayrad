import { Router } from "express";
import { validateUser } from "../controllers/auth-controller";
import { getDrivingLicenses } from "../controllers/license-controller";
const router = Router();

router.route('/licenses')
    .post(validateUser, getDrivingLicenses)

// router.route('/user-license').get(validateUser, getLicenses)

router.route('/hello')
    .get(validateUser, async (req, res) => {

        res.status(200).send(req.user)

    })

export { router as userRoute }