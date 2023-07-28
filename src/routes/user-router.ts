import { Router } from "express";
import { validateUser } from "../controllers/auth-controller";
import { getDrivingLicenses, getNegativePoints, getLicensePlates, getViolationReport, getViolationImage } from "../controllers/license-controller";
import { User } from "../models/user";
import { getPassport, leaveCountry } from "../controllers/passport";

const router = Router();

router.route('/driving-licenses')
    .post(validateUser, getDrivingLicenses);

router.route('/driving-licenses/negative-points')
    .post(validateUser, getNegativePoints);

router.route('/license-plates')
    .post(validateUser, getLicensePlates);

router.route('/license-plates/violations/report')
    .post(validateUser, getViolationReport);

router.route('/license-plates/violations/image')
    .post(validateUser, getViolationImage);

router.route('/passport')
    .post(validateUser, getPassport);

// BROKE: 
// router.route('/leave-country')
//     .post(validateUser, leaveCountry);

// FIX: for test only
router.route('/test').get(async (req, res, next) => {
    const user = await User.find({});

    res.status(201).json(user);
})

export { router as userRoute }