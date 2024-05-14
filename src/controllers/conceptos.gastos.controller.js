import jwt from 'jsonwebtoken'
import { mysql } from '../db/db.js'
import { SECRET_KEY } from '../config.js'
import { conceptAddSchema, conceptDeleteSchema, conceptEditSchema, conceptEditEstatusSchema } from '../schemas/concepto.schemas.js'

export const getConceptosByUser = async (req, res) => {
    try {
        jwt.verify(req.headers.token, SECRET_KEY, async (err, decoded) => {
            if (!err) {
                const [row] = await mysql.query(`SELECT * FROM conceptos_gastos WHERE id_usuarios = ? ORDER BY id_conceptos_gastos DESC`, decoded.id)
                const conceptos = row.map(concepto => {
                    return {
                        id: concepto.id_conceptos_gastos ,
                        description: concepto.c_concepto_gasto,
                        conteo: 0, //va a ser el conteo de gastos asociados
                        active: (concepto.c_activo ? true : false)
                    }
                });

                res.json({
                    status: 200,
                    response: {
                        gastos: conceptos,
                        movimientos: []
                    }
                });
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

export const addConceptosByUser = async (req, res) => {
    try {
        jwt.verify(req.headers.token, SECRET_KEY, async (err, decoded) => {
            if (!err) {
                const data = { concepto: req.body.concepto }
                const { error } = conceptAddSchema.validate(data);
                if (!error) {
                    const [row] = await mysql.query(`SELECT * FROM conceptos_gastos WHERE c_concepto_gasto = ? AND id_usuarios = ?`, [data.concepto, decoded.id])
                    if (row.length == 0) {
                        const insert = await mysql.query(`INSERT INTO conceptos_gastos (id_usuarios, c_concepto_gasto) VALUES (?, ?)`, [decoded.id, data.concepto]);
                        if (insert && insert.length > 0 && insert[0].affectedRows > 0) {
                            res.json({
                                status: 200,
                                response: {
                                    text: 'Se ha agregado el concepto correctamente',
                                    last: {
                                        id: insert[0].insertId,
                                        description: data.concepto,
                                        active: true
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
                                text: 'Ya existe un concepto con ese nombre, favor de validar su información'
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

export const editConceptosByUser = async (req, res) => {
    try {
        jwt.verify(req.headers.token, SECRET_KEY, async (err, decoded) => {
            if (!err) {
                const data = {
                    id_concepto: req.body.id_concepto,
                    concepto: req.body.concepto
                }

                const { error } = conceptEditSchema.validate(data);
                if (!error) {
                    const [row] = await mysql.query(`SELECT * FROM conceptos_gastos WHERE id_conceptos_gastos = ? AND id_usuarios = ?`, [data.id_concepto, decoded.id])
                    if (row.length != 0) {
                        const [valid] = await mysql.query(`SELECT * FROM conceptos_gastos WHERE c_concepto_gasto = ? AND id_usuarios = ?`, [data.concepto, decoded.id])
                        if(valid.length == 0 || valid.length == 1 && valid[0].id_conceptos_ingresos == data.id_concepto){
                            const update = await mysql.query(`UPDATE conceptos_gastos SET c_concepto_gasto = ? WHERE id_conceptos_gastos = ?`, [data.concepto, data.id_concepto]);
                            if (update && update.length > 0 && update[0].affectedRows > 0) {
                                res.json({
                                    status: 200,
                                    response: {
                                        text: 'Se ha actualizado el concepto correctamente',
                                        last: {
                                            id: data.id_concepto,
                                            description: data.concepto,
                                            active: (row[0].c_activo != 1 ? false : true)
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
                                    text: 'Ya existe otro concepto con ese nombre, favor de validar su información'
                                }
                            })
                        }
                    } else {
                        res.json({
                            status: 404,
                            response: {
                                text: 'El concepto no existe, favor de validar su información'
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

export const updateConceptosStatusByUser = async (req, res) => {
    try {
        jwt.verify(req.headers.token, SECRET_KEY, async (err, decoded) => {
            if (!err) {
                const data = {
                    id_concepto: req.body.id_concepto,
                    activo: req.body.activo
                }

                const { error } = conceptEditEstatusSchema.validate(data);
                if (!error) {
                    const [row] = await mysql.query(`SELECT * FROM conceptos_gastos WHERE id_conceptos_gastos = ? AND id_usuarios = ?`, [data.id_concepto, decoded.id])
                    if (row.length != 0) {
                        const update = await mysql.query(`UPDATE conceptos_gastos SET c_activo = ? WHERE id_conceptos_gastos = ?`, [(data.activo != 1 ? 0 : 1), data.id_concepto]);
                        if (update && update.length > 0 && update[0].affectedRows > 0) {
                            res.json({
                                status: 200,
                                response: {
                                    text: `Se ha ${(data.activo ? 'activado' : 'desactivado')} el concepto ${row[0].c_concepto_gasto} correctamente`,
                                    last: {
                                        id: data.id_concepto,
                                        description: row[0].c_concepto_gasto,
                                        active: (data.activo != 1 ? false : true)
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
                                text: 'El concepto no existe, favor de validar su información'
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

export const deleteConceptosByUser = async (req, res) => {
    try {
        jwt.verify(req.headers.token, SECRET_KEY, async (err, decoded) => {
            if (!err) {
                const data = { id_concepto: req.body.id_concepto }
                const { error } = conceptDeleteSchema.validate(data);

                if (!error) {
                    const [row] = await mysql.query(`SELECT * FROM conceptos_gastos WHERE id_conceptos_gastos = ? AND id_usuarios = ?`, [data.id_concepto, decoded.id])
                    if (row.length > 0) {
                        const update = await mysql.query(`DELETE FROM conceptos_gastos WHERE id_conceptos_gastos = ?`, data.id_concepto);
                        if (update && update.length > 0 && update[0].affectedRows > 0) {
                            res.json({
                                status: 200,
                                response: {
                                    text: 'Se ha eliminado el concepto correctamente'
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
                                text: 'El concepto no existe, favor de validar su información'
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