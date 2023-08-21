import Joi from "joi";

const carPlateRegex = /[0-9]{9}$/;
const cyclePlateRegex = /^08[0-9]{8}000$/;


const plateSchema = Joi.object({
    licensePlate: Joi.alternatives().try(Joi.string().pattern(new RegExp(carPlateRegex)).message('not valid license plate').length(9), Joi.string().pattern(new RegExp(cyclePlateRegex)).message('not valid license plate').length(13)).required()
});

export { plateSchema as plateValidator };