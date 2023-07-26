import { Router } from "express";
import { validateUser } from "../controllers/auth-controller";
import { getDrivingLicenses, getNegativePoints, getLicensePlates } from "../controllers/license-controller";
const router = Router();
import { User } from "../models/user";

router.route('/driving-licenses')
    .post(validateUser, getDrivingLicenses);


router.route('/driving-licenses/negative-points')
    .post(validateUser, getNegativePoints);

router.route('/license-plates')
    .post(validateUser, getLicensePlates);

// FIX: for test only
router.route('/insert-user').get(async (req, res, next) => {
    const user = new User({
        firstName: "shy",
        lastName: "amo",
        nationalCode: "0022553975",
        mobile: "09384009969"
    })

    await user.save();

    res.status(201).json(user);
})

export { router as userRoute }