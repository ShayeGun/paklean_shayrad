import Joi from "joi";

const stringyNumberRegex = /^[0-9]{10}$/;
const licenseSchema = Joi.object({

    drivingLicense: Joi.string()
        .pattern(new RegExp(stringyNumberRegex)).message('not valid driving license').required(),

});

export { licenseSchema as licenseValidator };