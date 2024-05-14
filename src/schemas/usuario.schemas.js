import Joi from "joi";

export const usuarioAddSchema = Joi.object({
    nombre: Joi.string().required(),
    apellidop: Joi.string().required(),
    apellidom: Joi.string().required(),
    fecha: Joi.date().max('now').required(),
    genero: Joi.number().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(1).max(100).required(),
});

export const usuarioEditSchema = Joi.object({
    id_usuario: Joi.number().required(),
    nombre: Joi.string().required(),
    apellidop: Joi.string().required(),
    apellidom: Joi.string().required(),
    fecha: Joi.date().max('now').required(),
    genero: Joi.number().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(1).max(100).required(),
});

export const usuarioDeleteSchema = Joi.object({
    id_usuario: Joi.number().required()
});