import Joi from "joi";

const stringyNumberRegex = /^[0-9]+$/;
const violationSchema = Joi.object({

    violationId: Joi.string()
        .pattern(new RegExp(stringyNumberRegex)).message('not valid violation id').required(),

});

export { violationSchema as violationValidator };