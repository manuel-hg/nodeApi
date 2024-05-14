import jwt from 'jsonwebtoken'
import { mysql } from '../db/db.js'
import { SECRET_KEY } from '../config.js'
import { groupAddSchema, groupDeleteSchema, groupEditSchema, groupEditEstatusSchema } from '../schemas/group.schemas.js'

export const getGroupsByUser = async (req, res) => {
    try {
        jwt.verify(req.headers.token, SECRET_KEY, async (err, decoded) => {
            if (!err) {
                const [row] = await mysql.query(`SELECT * FROM grupos_gastos WHERE id_usuarios = ? ORDER BY id_grupo_gasto desc`, [decoded.id]);

                const grupos = row.map(grupo => {
                    return {
                        id: grupo.id_grupo_gasto + '/' + (grupo.gr_tarjeta_credito !== 1 ? 2 : 1),
                        description: grupo.gr_tipo_grupo,
                        isCreditCard: (grupo.gr_tarjeta_credito !== 1 ? 2 : 1),
                        corte: (grupo.gr_tarjeta_credito == 1 ? Number(grupo.gr_tarjeta_fcorte) : null),
                        conteo: 0,
                        active: (grupo.gr_activo ? true : false)
                    }
                })

                res.json({
                    status: 200,
                    response: {
                        data: grupos
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
        });
    } catch (error) {
        res.json({
            status: 500,
            response: {
                //text: `Someting goes wrong ${error}`
                text: 'Ha ocurrido un error, intente nuevamente'
            }
        });
    }
};

export const addGroupsByUser = async (req, res) => {
    try {
        jwt.verify(req.headers.token, SECRET_KEY, async (err, decoded) => {
            if (!err) {
                const data = {
                    grupo: req.body.grupo,
                    tc: req.body.tc,
                    fecha_corte: req.body.fecha_corte
                }
                const { error } = groupAddSchema.validate(data);
                if (!error) {
                    const [row] = await mysql.query(`SELECT * FROM grupos_gastos WHERE gr_tipo_grupo = ? AND id_usuarios = ?`, [data.grupo, decoded.id])
                    if (row.length == 0) {
                        const insert = await mysql.query(`INSERT INTO grupos_gastos (id_usuarios, gr_tipo_grupo, gr_tarjeta_credito, gr_tarjeta_fcorte) VALUES (?, ?, ?, ?)`, [decoded.id, data.grupo, data.tc, (data.fecha_corte != '' ? data.fecha_corte : null)]);
                        if (insert && insert.length > 0 && insert[0].affectedRows > 0) {
                            res.json({
                                status: 200,
                                response: {
                                    text: 'Se ha agregado el grupo correctamente',
                                    last: {
                                        id: insert[0].insertId + '/' + (data.tc !== 1 ? 2 : 1),
                                        description: data.grupo,
                                        isCreditCard: (data.tc !== 1 ? 2 : 1),
                                        corte: (data.tc == 1 ? Number(data.fecha_corte) : null),
                                        conteo: 0,
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
                                text: 'Ya existe un grupo con ese nombre, favor de validar su información'
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


export const editGroupsByUser = async (req, res) => {
    try {
        jwt.verify(req.headers.token, SECRET_KEY, async (err, decoded) => {
            if (!err) {
                const data = {
                    id_grupo: req.body.id_grupo,
                    grupo: req.body.grupo,
                    tc: req.body.tc,
                    fecha_corte: req.body.fecha_corte
                }

                const { error } = groupEditSchema.validate(data);
                if (!error) {
                    const [row] = await mysql.query(`SELECT * FROM grupos_gastos WHERE id_grupo_gasto = ? AND id_usuarios = ?`, [data.id_grupo, decoded.id])
                    if (row.length != 0) {
                        const [valid] = await mysql.query(`SELECT * FROM grupos_gastos WHERE gr_tipo_grupo = ? AND id_usuarios = ?`, [data.grupo, decoded.id])
                        if (valid.length == 0 || valid.length == 1 && valid[0].id_grupo_gasto == data.id_grupo) {
                            const update = await mysql.query(`UPDATE grupos_gastos SET gr_tipo_grupo = ?, gr_tarjeta_credito = ?, gr_tarjeta_fcorte = ? WHERE id_grupo_gasto = ?`, [data.grupo, data.tc, (data.tc == 1 && data.fecha_corte != '' ? data.fecha_corte : null), data.id_grupo]);
                            if (update && update.length > 0 && update[0].affectedRows > 0) {
                                res.json({
                                    status: 200,
                                    response: {
                                        text: 'Se ha actualizado el grupo correctamente',
                                        last: {
                                            id: data.id_grupo + '/' + (data.tc !== 1 ? 2 : 1),
                                            description: data.grupo,
                                            isCreditCard: (data.tc !== 1 ? 2 : 1),
                                            corte: (data.tc == 1 ? Number(data.fecha_corte) : null),
                                            conteo: 0,
                                            active: (row[0].gr_activo ? true : false)
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
                                    text: 'El grupo no existe, favor de validar su información'
                                }
                            })
                        }
                    } else {
                        res.json({
                            status: 404,
                            response: {
                                text: 'Ya existe otro grupo con ese nombre, favor de validar su información'
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

export const updateGroupsStatusByUser = async (req, res) => {
    try {
        jwt.verify(req.headers.token, SECRET_KEY, async (err, decoded) => {
            if (!err) {
                const data = {
                    id_grupo: req.body.id_grupo,
                    activo: req.body.activo
                }

                const { error } = groupEditEstatusSchema.validate(data);
                if (!error) {
                    const [row] = await mysql.query(`SELECT * FROM grupos_gastos WHERE id_grupo_gasto = ? AND id_usuarios = ?`, [data.id_grupo, decoded.id])
                    if (row.length != 0) {
                        const update = await mysql.query(`UPDATE grupos_gastos SET gr_activo = ? WHERE id_grupo_gasto = ?`, [(data.activo != 1 ? 0 : 1), data.id_grupo]);
                        if (update && update.length > 0 && update[0].affectedRows > 0) {
                            res.json({
                                status: 200,
                                response: {
                                    text: `Se ha ${(data.activo ? 'activado' : 'desactivado')} el grupo ${row[0].gr_tipo_grupo} correctamente`,
                                    last: {
                                        id: row[0].id_grupo_gasto + '/' + (row[0].gr_tarjeta_credito !== 1 ? 2 : 1),
                                        description: row[0].gr_tipo_grupo,
                                        isCreditCard: (row[0].gr_tarjeta_credito !== 1 ? 2 : 1),
                                        corte: (row[0].gr_tarjeta_credito == 1 ? Number(row[0].gr_tarjeta_fcorte) : null),
                                        active: (data.activo ? true : false)
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
                                text: 'El grupo no existe, favor de validar su información'
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

export const deleteGroupsByUser = async (req, res) => {
    try {
        jwt.verify(req.headers.token, SECRET_KEY, async (err, decoded) => {
            if (!err) {
                const data = { id_grupo: req.body.id_grupo }

                const { error } = groupDeleteSchema.validate(data);
                if (!error) {
                    const [row] = await mysql.query(`SELECT * FROM grupos_gastos WHERE id_grupo_gasto = ? AND id_usuarios = ?`, [data.id_grupo, decoded.id])
                    if (row.length > 0) {
                        const [valid] = await mysql.query(`SELECT * FROM fondo_ingresos WHERE id_grupo_gasto = ? AND id_usuarios = ?`, [data.id_grupo, decoded.id])
                        if(valid.length == 0){
                            const deleted = await mysql.query(`DELETE FROM grupos_gastos WHERE id_grupo_gasto = ?`, [data.id_grupo]);
                            if (deleted && deleted.length > 0 && deleted[0].affectedRows > 0) {
                                res.json({
                                    status: 200,
                                    response: {
                                        text: 'Se ha eliminado el grupo correctamente'
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
                                    text: 'No es posible eliminar el grupo, ya que contiene información de ingresos o gastos que lo relacionan'
                                }
                            })
                        }
                    } else {
                        res.json({
                            status: 404,
                            response: {
                                text: 'El grupo no existe, favor de validar su información'
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