import jwt, { decode } from 'jsonwebtoken'
import { mysql } from '../db/db.js'
import { getDate, SECRET_KEY } from '../config.js'
import { ingresoAddSchema, ingresoDeleteSchema, ingresoEditSchema } from '../schemas/ingreso.schemas.js'
export const getIngresosByUser = async (req, res) => {
    try {
        jwt.verify(req.headers.token, SECRET_KEY, async (err, decoded) => {
            if (!err) {
                const [row] = await mysql.query(`select * from fondo_ingresos 
                join usuarios on usuarios.id_usuarios = fondo_ingresos.id_usuarios 
                join grupos_gastos on grupos_gastos.id_grupo_gasto = fondo_ingresos.id_grupo_gasto 
                join conceptos_ingresos on conceptos_ingresos.id_conceptos_ingresos = fondo_ingresos.id_conceptos_ingresos 
                WHERE fondo_ingresos.id_usuarios = ?`, decoded.id)
                const movimientos = row.map(ingreso => {
                    return {
                        id: ingreso.id_ingreso,
                        grupo: {
                            id: ingreso.id_grupo_gasto + '/' + (ingreso.gr_tarjeta_credito !== 1 ? 2 : 1),
                            description: ingreso.gr_tipo_grupo
                        },
                        concepto: {
                            id: ingreso.id_conceptos_ingresos,
                            description: ingreso.ci_concepto
                        },
                        detalle: ingreso.in_detalle,
                        monto: ingreso.in_monto,
                        recurrente: (ingreso.in_recurrente ? true : false),
                        periodo: (ingreso.in_recurrente ? {
                            id: ingreso.in_periodo,
                            description: (ingreso.in_periodo == 1 ? 'Semanal' : (ingreso.in_periodo == 2 ? 'Mensual' : 'Anual')),
                            fecha: ingreso.in_corte
                        } : null)
                    }
                })
                res.json({
                    status: 200,
                    response: {
                        movimientos: movimientos
                    }
                })
            } else {
                res.json({
                    status: 401,
                    response: {
                        text: "Token Inválido"
                    }
                });
            }
        })
    } catch (error) {
        res.json({
            status: 500,
            response: {
                text: 'Ha ocurrido un error, intente nuevamente'
            }
        })
    }
}

export const addIngresosByUser = async (req, res) => {
    try {
        jwt.verify(req.headers.token, SECRET_KEY, async (err, decoded) => {
            if (!err) {
                const data = {
                    id_grupo: req.body.id_grupo,
                    id_concepto: req.body.id_concepto,
                    detalle: req.body.detalle,
                    monto: req.body.monto,
                    fecha: req.body.fecha,
                    recurrente: req.body.recurrente,
                    periodo: req.body.periodo,
                    corte: req.body.corte
                }

                const { error } = ingresoAddSchema.validate(data);

                if (!error) {
                    const [grupo] = await mysql.query(`SELECT * FROM grupos_gastos WHERE id_usuarios = ? and id_grupo_gasto = ?`, [decoded.id, data.id_grupo]);
                    if (grupo.length > 0) {
                        const [concepto] = await mysql.query(`SELECT * FROM conceptos_ingresos WHERE id_usuarios = ? and id_conceptos_ingresos = ?`, [decoded.id, data.id_concepto]);
                        if (concepto.length > 0) {
                            const insert = await mysql.query(`INSERT INTO fondo_ingresos (id_usuarios, id_grupo_gasto, id_conceptos_ingresos, in_monto, in_fecha, in_detalle, in_recurrente, in_periodo, in_corte, in_fecha_mov) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [decoded.id, data.id_grupo, data.id_concepto, data.monto, data.fecha, data.detalle, (data.recurrente ? data.recurrente : 0), data.periodo, data.corte, getDate('Y-m-d H:i:s')]);
                            if (insert && insert.length > 0 && insert[0].affectedRows > 0) {

                                const [row] = await mysql.query(`select * from fondo_ingresos 
                                            join usuarios on usuarios.id_usuarios = fondo_ingresos.id_usuarios 
                                            join grupos_gastos on grupos_gastos.id_grupo_gasto = fondo_ingresos.id_grupo_gasto 
                                            join conceptos_ingresos on conceptos_ingresos.id_conceptos_ingresos = fondo_ingresos.id_conceptos_ingresos 
                                            WHERE id_ingreso = ?`, insert[0].insertId)

                                res.json({
                                    status: 200,
                                    response: {
                                        text: 'Se ha agregado el ingreso correctamente',
                                        last: {
                                            id: row[0].id_ingreso,
                                            grupo: {
                                                id: row[0].id_grupo_gasto + '/' + (row[0].gr_tarjeta_credito !== 1 ? 2 : 1),
                                                description: row[0].gr_tipo_grupo
                                            },
                                            concepto: {
                                                id: row[0].id_conceptos_ingresos,
                                                description: row[0].ci_concepto
                                            },
                                            detalle: row[0].in_detalle,
                                            monto: row[0].in_monto,
                                            recurrente: (row[0].in_recurrente ? true : false),
                                            periodo: (row[0].in_recurrente ? {
                                                id: row[0].in_periodo,
                                                description: (row[0].in_periodo == 1 ? 'Semanal' : (row[0].in_periodo == 2 ? 'Mensual' : 'Anual')),
                                                fecha: row[0].in_corte
                                            } : null)
                                        }
                                    }
                                })
                            } else {
                                res.json({
                                    status: 404,
                                    response: {
                                        text: 'Ha ocurrido un error, intente nuevamente'
                                    }
                                })
                            }
                        } else {
                            res.json({
                                status: 404,
                                response: {
                                    text: 'Ha ocurrido un error, intente nuevamente'
                                }
                            })
                        }
                    } else {
                        res.json({
                            status: 404,
                            response: {
                                text: 'Ha ocurrido un error, intente nuevamente' 
                            }
                        })
                    }
                } else {
                    res.json({
                        status: 404,
                        response: {
                            text: 'Ha ocurrido un error, favor de validar su información'
                        }
                    })
                }
            } else {
                res.json({
                    status: 401,
                    response: {
                        text: "Token Inválido"
                    }
                });
            }
        })
    } catch (error) {
        res.json({
            status: 500,
            response: {
                text: 'Ha ocurrido un error, intente nuevamente'
            }
        })
    }
}


export const editIngresosByUser = async (req, res) => {
    try {
        jwt.verify(req.headers.token, SECRET_KEY, async (err, decoded) => {
            if (!err) {
                const data = {
                    id_ingreso: req.body.id_ingreso,
                    id_grupo: req.body.id_grupo,
                    id_concepto: req.body.id_concepto,
                    detalle: req.body.detalle,
                    monto: req.body.monto,
                    fecha: req.body.fecha,
                    recurrente: req.body.recurrente,
                    periodo: req.body.periodo,
                    corte: req.body.corte
                }

                const { error } = ingresoEditSchema.validate(data);

                if (!error) {
                    const row = await mysql.query(`SELECT * FROM fondo_ingresos WHERE id_ingreso = ? AND id_usuarios = ?`, [data.id_ingreso, decoded.id])
                    if (row.length > 0) {
                        const update = await mysql.query(`UPDATE fondo_ingresos SET id_grupo_gasto = ?, id_conceptos_ingresos = ?, in_monto = ?, in_fecha = ?, in_detalle = ?, in_recurrente = ?, in_periodo = ?, in_corte = ?, in_fecha_mov_update = ? WHERE id_ingreso = ?`, [data.id_grupo, data.id_concepto, data.monto, data.fecha, data.detalle, (data.recurrente ? data.recurrente : 0), data.periodo, data.corte, getDate('Y-m-d H:i:s'), data.id_ingreso]);
                        if (update && update.length > 0 && update[0].affectedRows > 0) {
                            const [row] = await mysql.query(`select * from fondo_ingresos 
                            join usuarios on usuarios.id_usuarios = fondo_ingresos.id_usuarios 
                            join grupos_gastos on grupos_gastos.id_grupo_gasto = fondo_ingresos.id_grupo_gasto 
                            join conceptos_ingresos on conceptos_ingresos.id_conceptos_ingresos = fondo_ingresos.id_conceptos_ingresos 
                            WHERE id_ingreso = ?`, data.id_ingreso)

                            res.json({
                                status: 200,
                                response: {
                                    text: 'Se ha actualizado el ingreso correctamente',
                                    last: {
                                        id: row[0].id_ingreso,
                                        grupo: {
                                            id: row[0].id_grupo_gasto + '/' + (row[0].gr_tarjeta_credito !== 1 ? 2 : 1),
                                            description: row[0].gr_tipo_grupo
                                        },
                                        concepto: {
                                            id: row[0].id_conceptos_ingresos,
                                            description: row[0].ci_concepto
                                        },
                                        detalle: row[0].in_detalle,
                                        monto: row[0].in_monto,
                                        recurrente: (row[0].in_recurrente ? true : false),
                                        periodo: (row[0].in_recurrente ? {
                                            id: row[0].in_periodo,
                                            description: (row[0].in_periodo == 1 ? 'Semanal' : (row[0].in_periodo == 2 ? 'Mensual' : 'Anual')),
                                            fecha: row[0].in_corte
                                        } : null)
                                    }
                                }
                            })
                        } else {
                            res.json({
                                status: 404,
                                response: {
                                    text: 'Ha ocurrido un error, intente nuevamente'
                                }
                            })
                        }
                    } else {
                        res.json({
                            status: 404,
                            response: {
                                text: 'El ingreso no existe, favor de validar su información'
                            }
                        })
                    }
                } else {
                    res.json({
                        status: 404,
                        response: {
                            text: 'Ha ocurrido un error, favor de validar su información' + error
                        }
                    })
                }
            } else {
                res.json({
                    status: 401,
                    response: {
                        text: "Token Inválido"
                    }
                });
            }
        })
    } catch (error) {
        res.json({
            status: 500,
            response: {
                //text: `Someting goes wrong ${error}`
                text: 'Ha ocurrido un error, intente nuevamente'
            }
        })
    }
}

export const deleteIngresosByUser = async (req, res) => {
    try {
        jwt.verify(req.headers.token, SECRET_KEY, async (err, decoded) => {
            if (!err) {
                const data = { id_ingreso: req.body.id_ingreso }
                const { error } = ingresoDeleteSchema.validate(data);

                if (!error) {
                    const row = await mysql.query(`SELECT * FROM fondo_ingresos WHERE id_ingreso = ? AND id_usuarios = ?`, [data.id_ingreso, decoded.id])
                    if (row.length > 0) {
                        const deleted = await mysql.query(`DELETE FROM fondo_ingresos WHERE id_ingreso = ?`, data.id_ingreso);
                        if (deleted && deleted.length > 0 && deleted[0].affectedRows > 0) {
                            res.json({
                                status: 200,
                                response: {
                                    text: 'Se ha eliminado el ingreso correctamente'
                                }
                            })
                        } else {
                            res.json({
                                status: 404,
                                response: {
                                    text: 'Ha ocurrido un error, intente nuevamente'
                                }
                            })
                        }
                    } else {
                        res.json({
                            status: 404,
                            response: {
                                text: 'El ingreso no existe, favor de validar su información'
                            }
                        })
                    }
                } else {
                    res.json({
                        status: 404,
                        response: {
                            text: 'Ha ocurrido un error, favor de validar su información'
                        }
                    })
                }
            } else {
                res.json({
                    status: 401,
                    response: {
                        text: "Token Inválido"
                    }
                });
            }
        })
    } catch (error) {
        res.json({
            status: 500,
            response: {
                //text: `Someting goes wrong ${error}`
                text: 'Ha ocurrido un error, intente nuevamente'
            }
        })
    }
}