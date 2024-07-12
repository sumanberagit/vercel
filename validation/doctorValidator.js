// validators.js
const Joi = require('joi');

const phoneNumberWithCountryCode = Joi.string().pattern(/^\+[1-9]{1}[0-9]{3,14}$/).messages({
    'string.pattern.base': `Phone number must include country code and be in the format +<country code><phone number>. Example: +1234567890`
});

const updateDoctorSchema = Joi.object({
    name: Joi.string().required(),
    image: Joi.string().required(),
    contact: phoneNumberWithCountryCode.required(),
    email: Joi.string().email().required(),
    desc: Joi.string().required(),
    ammount: Joi.number().required()
});

module.exports = {
    updateDoctorSchema
};
