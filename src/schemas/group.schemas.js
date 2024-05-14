import Joi from "joi";

export const groupAddSchema = Joi.object({
    grupo: Joi.string().required(),
    tc: Joi.number().required(),
    fecha_corte: Joi.number().allow(null)
});

export const groupEditSchema = Joi.object({
    id_grupo: Joi.number().required(),
    grupo: Joi.string().required(),
    tc: Joi.number().required(),
    fecha_corte: Joi.number().allow(null)
});

export const groupEditEstatusSchema = Joi.object({
    id_grupo: Joi.number().required(),
    activo: Joi.boolean().required()
})

export const groupDeleteSchema = Joi.object({
    id_grupo: Joi.number().required()
});