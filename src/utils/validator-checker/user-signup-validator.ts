import Joi from "joi"

// const persianRegex = /^[آ-ی]+$/
const englishRegex = /^[a-zA-Z]+$/
const stringyNumberRegex = /^[0-9]+$/
const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,30}$/
const phoneRegex = /^09[0-9]{9}$/

const userSchema = Joi.object({

    firstName: Joi.string().pattern(new RegExp(englishRegex)).min(3).max(30).required(),

    lastName: Joi.string().pattern(new RegExp(englishRegex)).min(3).max(30).required(),

    password: Joi.string()
        .pattern(new RegExp(passwordRegex)).required(),

    nationalCode: Joi.string()
        .pattern(new RegExp(stringyNumberRegex)).length(10).required(),

    phone: Joi.string()
        .pattern(new RegExp(phoneRegex)).length(11).required(),

    email: Joi.string().email().required(),
})

export { userSchema as userSignupValidator }