import { Router } from "express";
import { validateUser } from "../middlewares/auth-controller";
import { getDrivingLicenses, getNegativePoints, getLicensePlates, getViolationReport, getViolationImage, getViolationAggregate, getPlateDoc } from "../controllers/license-controller";
import { User } from "../models/user";
import { getPassport } from "../controllers/passport";
import { checkPlate } from "../middlewares/check-plate";
import { checkLicense } from "../middlewares/check-license";

const router = Router();

router.route('/driving-licenses')
    .post(validateUser, getDrivingLicenses);

router.route('/driving-licenses/negative-points')
    .post(validateUser, checkLicense, getNegativePoints);

router.route('/license-plates')
    .post(validateUser, getLicensePlates);

router.route('/license-plates/violations/report')
    .post(validateUser, checkPlate, getViolationReport);

router.route('/license-plates/violations/image')
    .post(validateUser, checkPlate, getViolationImage);

router.route('/license-plates/violations/aggregate')
    .post(validateUser, checkPlate, getViolationAggregate);

router.route('/license-plates/document')
    .post(validateUser, getPlateDoc);

router.route('/passport')
    .post(validateUser, getPassport);

// FIX: for test only
router.route('/test').get(async (req, res, next) => {
    const user = await User.find({});

    res.status(201).json(user);
});

export { router as userRoute };