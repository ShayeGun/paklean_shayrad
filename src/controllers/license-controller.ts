import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catch-async";
import { GetRequest } from "../utils/request-class/get-request";
import { License } from "../models/driving-licence";
import { PostRequest } from "../utils/request-class/post-request";
import { Plate } from "../models/driving-plate";


export const getDrivingLicenses = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/driving-licenses`, req.token);

    const licenses = await request.call();

    for (let license of licenses) {

        let existedLicense: any;

        if (license.nationalCode === null) {
            existedLicense = await License.findOne({
                nationalCode: req.user!.nationalCode
            })
        }
        else {
            existedLicense = await License.findOne({
                barcode: license.barcode,
                title: license.title
            })
        }

        // if the license isn't already existed in DB -> add new license
        if (!existedLicense) {
            const newLicense = new License(license);
            // for user's that don't have license (license.nationalCode = null)
            newLicense.nationalCode = req.user!.nationalCode;
            await newLicense.save();

            // update user's first and last name if its not defined -- shayrad's doing not mine sry )^,_^)
            if (req.user!.firstName === "-" || req.user!.lastName === "-") {
                // for user's that don't have license (license.firstName = null)

                req.user!.firstName = license.firstName ? license.firstName : "-";
                // for user's that don't have license (license.lastName = null)
                req.user!.lastName = license.lastName ? license.lastName : "-";

                await req.user!.save();
            }
        }
    }

    // add national-code to user's with no driving license 
    licenses[0].nationalCode = licenses[0].nationalCode === null ? req.user!.nationalCode : licenses[0].nationalCode

    res.status(200).send(licenses);
})

export const getNegativePoints = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    let license = await License.findOne({
        nationalCode: req.user!.nationalCode
    })

    if (!license) {
        // if no license was found request to /driving-licenses end point to create licenses and don't throw any error HURRAY :D
        const licenseRequest = new PostRequest(`${req.protocol}://${req.get('host')}/api/shayrad/v1/user/driving-licenses`, req.token)

        licenseRequest.setBody({
            nationalCode: req.user!.nationalCode,
            mobile: req.user!.mobile,
            otp: req.body.otp ? req.body.otp : ''
        })

        // first element of the array
        license = (await licenseRequest.call())[0];
    }

    const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/driving-licenses/${license!.printNumber}/negative-point`, req.token);

    const negPoint = await request.call();

    req.user!.negativePoint = negPoint.negativePoint
    req.user!.isDrivingAllowed = negPoint.isDrivingAllowed
    await req.user!.save();

    res.status(200).send(req.user);
})

export const getLicensePlates = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const request = new GetRequest(`${process.env.SERVER_ADDRESS}/naji/users/${req.user!.userId}/license-plates`, req.token);

    const plates = await request.call();


    for (let plate of plates) {

        let existedPlate: any;

        if (plate.nationalCode === null) {
            existedPlate = await License.findOne({
                nationalCode: req.user!.nationalCode
            })
        }
        else {
            existedPlate = await Plate.findOne({
                licensePlateNumber: plate.licensePlateNumber
            })
        }

        // if the plate isn't already existed in DB -> add new plate
        if (!existedPlate?.nationalCode) {
            const newPlate = new Plate(plate);
            newPlate.nationalCode = req.user!.nationalCode;
            await newPlate.save();
        }
    }

    res.status(200).send(plates);
})