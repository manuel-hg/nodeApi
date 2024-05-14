import { mysql } from '../db/db.js'
import { usuarioAddSchema, usuarioDeleteSchema, usuarioEditSchema } from '../schemas/usuario.schemas.js'

export const getUsuario = async (req, res) => {
    try {
        if (req.body.id_usuario) {
            const [row] = await mysql.query(`SELECT * FROM usuarios WHERE id_usuarios = ?`, req.body.id_usuario)
            res.json({
                status: 200,
                response: row
            })
        } else {
            res.json({
                status: 404,
                response: {
                    text: 'Ha ocurrido un error, intente nuevamente'
                }
            })
        }
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

export const addUsuario = async (req, res) => {
    try {
        const data = {
            nombre: req.body.nombre,
            apellidop: req.body.apellidop,
            apellidom: req.body.apellidom,
            fecha: req.body.fecha,
            genero: req.body.genero,
            email: req.body.email,
            password: req.body.password,
        }

        const { error } = usuarioAddSchema.validate(data);
        if (!error) {
            const [row] = await mysql.query(`SELECT * FROM usuarios WHERE us_email = ?`, data.email)
            if (row.length == 0) {
                const insert = await mysql.query(`INSERT INTO usuarios (us_nombres, us_apellidop, us_apellidom, us_fecha_nac, us_genero, us_email, us_password) VALUES (?, ?, ?, ?, ?, ?, ?)`, [data.nombre, data.apellidop, data.apellidom, data.fecha, (data.genero == 1 ? 'M' : (data.genero == 2 ? 'F' : 'PN')), data.email, data.password]);
                if (insert && insert.length > 0 && insert[0].affectedRows > 0) {
                    res.json({
                        status: 200,
                        response: {
                            text: 'Se ha agregado el usuario correctamente'
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
                        text: 'Ya existe un usuario con ese email, favor de validar su información'
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

export const editUsuario = async (req, res) => {
    try {
        const data = {
            id_usuario: req.body.id_usuario,
            nombre: req.body.nombre,
            apellidop: req.body.apellidop,
            apellidom: req.body.apellidom,
            fecha: req.body.fecha,
            genero: req.body.genero,
            email: req.body.email,
            password: req.body.password,
        }

        const { error } = usuarioEditSchema.validate(data);
        if (!error) {
            const [row] = await mysql.query(`SELECT * FROM usuarios WHERE us_email = ?`, data.email)
            if (row.length == 1) {
                const insert = await mysql.query(`UPDATE usuarios SET us_nombres = ?, us_apellidop = ?, us_apellidom = ?, us_fecha_nac = ? , us_genero = ?, us_password = ? WHERE id_usuarios = ?`, [data.nombre, data.apellidop, data.apellidom, data.fecha, (data.genero == 1 ? 'M' : (data.genero == 2 ? 'F' : 'PN')), data.password, data.id_usuario]);
                if (insert && insert.length > 0 && insert[0].affectedRows > 0) {
                    res.json({
                        status: 200,
                        response: {
                            text: 'Se ha actualizado el usuario correctamente'
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
                        text: 'Ya existe un usuario con ese email, favor de validar su información'
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

export const deleteUsuario = async (req, res) => {
    try {
        const data = {id_usuario: req.body.id_usuario}

        /*const data = {id_usuario: 16}*/

        const { error } = usuarioDeleteSchema.validate(data);
        if (!error) {
            const [row] = await mysql.query(`SELECT * FROM usuarios WHERE id_usuarios = ?`, data.id_usuario)
            if(row.length != 0){
                const update = await mysql.query(`DELETE FROM usuarios WHERE id_usuarios = ?`, [data.id_usuario]);
                if(update && update.length > 0 && update[0].affectedRows > 0 ){
                    res.json({
                        status: 200,
                        response: {
                            text: 'Se ha eliminado el usuario correctamente'
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