import Joi from "joi";

export const conceptAddSchema = Joi.object({
    concepto: Joi.string().required()
});

export const conceptEditSchema = Joi.object({
    id_concepto: Joi.number().required(),
    concepto: Joi.string().required()
});

export const conceptEditEstatusSchema = Joi.object({
    id_concepto: Joi.number().required(),
    activo: Joi.boolean().required()
})


export const conceptDeleteSchema = Joi.object({
    id_concepto: Joi.number().required()
});
