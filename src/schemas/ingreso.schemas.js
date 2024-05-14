import Joi from "joi";

export const ingresoAddSchema = Joi.object({
    id_grupo: Joi.number().required(),
    id_concepto: Joi.number().required(),
    monto: Joi.number().required(),
    fecha: Joi.date().required(),
    detalle: Joi.string(),
    recurrente: Joi.number().allow(null),
    periodo: Joi.string().allow(null),
    corte: Joi.string().allow(null)
});

export const ingresoEditSchema = Joi.object({
    id_ingreso: Joi.number().required(),
    id_grupo: Joi.number().required(),
    id_concepto: Joi.number().required(),
    monto: Joi.number().required(),
    fecha: Joi.date().required(),
    detalle: Joi.string(),
    recurrente: Joi.number().allow(null),
    periodo: Joi.string().allow(null),
    corte: Joi.string().allow(null)
});

export const ingresoDeleteSchema = Joi.object({
    id_ingreso: Joi.number().required()
});