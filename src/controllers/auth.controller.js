import jwt from 'jsonwebtoken'
import { authLoginSchema } from "../schemas/auth.schemas.js";
import { formatDate_Ymd, SECRET_KEY } from '../config.js'
import { mysql } from '../db/db.js'

export const authLogin = async (req, res) => {

    try {
        const data = {
            email: req.body.email,
            password: req.body.password,
        }

        const { error } = authLoginSchema.validate(data);
        if (!error) {
            const [row] = await mysql.query(`SELECT * FROM usuarios WHERE us_email = ? and us_password = ?`, [data.email, data.password])
            if (row.length > 0) {

                if(req.headers.token != row[0].us_token_notif){
                    await mysql.query(`UPDATE usuarios SET us_token_notif = ? WHERE id_usuarios = ?`, [req.headers.token, row[0].id_usuarios]);
                }

                res.json({
                    status: 200,
                    response: {
                        'user': {
                            'names': row[0].us_nombres,
                            'first_last': row[0].us_apellidop,
                            'second_last': row[0].us_apellidom,
                            'birth_date': formatDate_Ymd(row[0].us_fecha_nac),
                            'sex': (row[0].us_genero == 'M' ? 1 : (row[0].us_genero == 'F' ? 2 : 3)),
                            'email': row[0].us_email,
                            'password': row[0].us_password,
                            'token': jwt.sign({ id: row[0].id_usuarios }, SECRET_KEY, { expiresIn: '30 days' }),
                            'img': req.protocol + '://' + req.get('host') + '/uploads/' + (row[0].us_foto != null ? row[0].us_foto : 'avatar.jpg')
                        }
                    }
                })
            } else {
                res.json({
                    status: 404,
                    response: {
                        text: 'El usuario y/o contraseña son incorrectos'
                    }
                })
            }
        } else {
            res.json({
                status: 404,
                response: {
                    text: 'Usuario y/o contraseña incorrectos'
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