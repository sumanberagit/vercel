// validators.js
const Joi = require('joi');

const phoneNumberWithCountryCode = Joi.string().pattern(/^\+[1-9]{1}[0-9]{3,14}$/).messages({
    'string.pattern.base': `Phone number must include country code and be in the format +<country code><phone number>. Example: +1234567890`
});

const signupSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
    gender: Joi.string().required(),
    location: Joi.string().required(),
    phone: phoneNumberWithCountryCode.optional()
});

const signinSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

const doctorSignupSchema = Joi.object({
    name: Joi.string().required(),
    expertise: Joi.string().required(),
    image: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    contact: phoneNumberWithCountryCode.required(),
    desc: Joi.string().required(),
    date: Joi.date().required(),
    ammount: Joi.number().required(),
    is_doctor: Joi.boolean().required()
});

const doctorSigninSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

module.exports = {
    signupSchema,
    signinSchema,
    doctorSignupSchema,
    doctorSigninSchema
};
