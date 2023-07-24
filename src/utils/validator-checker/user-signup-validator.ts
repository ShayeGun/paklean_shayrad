import Joi from "joi"

const stringyNumberRegex = /^[0-9]+$/
const phoneRegex = /^09[0-9]{9}$/

const userSchema = Joi.object({

    nationalCode: Joi.string()
        .pattern(new RegExp(stringyNumberRegex)).length(10).required(),

    mobile: Joi.string()
        .pattern(new RegExp(phoneRegex)).length(11).required(),

    otp: Joi.any().optional()

})

export { userSchema as userSignupValidator }