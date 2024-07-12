// validators.js
const Joi = require('joi');

const doctorSchema = Joi.object({
    name: Joi.string().required(),
    expertise: Joi.string().required(),
    image: Joi.string().required(),
    date: Joi.date().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    desc: Joi.string().required(),
    contact: Joi.string().required(),
    ammount: Joi.number().required()
});

const updateAppointmentSchema = Joi.object({
    _id: Joi.string().required(),
    status: Joi.string().required(),
    invoice: Joi.string().required()
});

module.exports = {
    doctorSchema,
    updateAppointmentSchema
};
