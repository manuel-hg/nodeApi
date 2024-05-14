import jwt from 'jsonwebtoken'
import { mysql } from '../db/db.js'
import { SECRET_KEY, currencyFormat } from '../config.js'
export const dashboard = async (req, res) => {
    try {
        jwt.verify(req.headers.token, SECRET_KEY, async (err, decoded) => {
            if (!err) {
                const [calculo] = await mysql.query(`
                    select
                        usuarios.id_usuarios,
                        ROUND(SUM(IF(in_monto IS NOT NULL, in_monto, 0)), 2) as monto_ingresos,
                        1000.00 as monto_gastos,
                        SUM(IF(in_monto is null, 0, in_monto)) - 1000 as balance,
                        IF(SUM(IF(in_monto IS NOT NULL, in_monto, 0)) > 0,
                            ROUND((ROUND((SUM(IF(in_monto IS NOT NULL, in_monto, 0)) - 1000) / SUM(IF(in_monto IS NOT NULL, in_monto, 0)), 2))* 100),
                        0) as porcentaje_i,
                        IF(SUM(IF(in_monto is null, 0, in_monto)) - 1000 != 0,100 - (IF(SUM(IF(in_monto IS NOT NULL, in_monto, 0)) > 0,
                            ROUND((ROUND((SUM(IF(in_monto IS NOT NULL, in_monto, 0)) - 1000) / SUM(IF(in_monto IS NOT NULL, in_monto, 0)), 2))* 100),
                        0)),0) AS porcentaje_g
                    from usuarios
                    left join fondo_ingresos on fondo_ingresos.id_usuarios = usuarios.id_usuarios
                    where usuarios.id_usuarios = ?
                    group by usuarios.id_usuarios`, [decoded.id])

                const [plazos] = await mysql.query(`SELECT * FROM plazos ORDER BY id_plazo`);
                const setPlazos = plazos.map(plazo => ({
                    id: plazo.id_plazo,
                    description: plazo.p_descripcion
                }));

                const [notificaciones] = await mysql.query(`SELECT * FROM notificaciones ORDER BY id_notificacion desc limit 1`)

                const [conceptosI] = await mysql.query(`SELECT * FROM conceptos_ingresos WHERE id_usuarios = ? ORDER BY id_conceptos_ingresos DESC`, decoded.id)
                const conceptosingresos = conceptosI.map(concepto => {
                    return {
                        active: (concepto.ci_activo ? true : false),
                        description: concepto.ci_concepto,
                        id: concepto.id_conceptos_ingresos,
                    }
                });
                
                const [conceptosG] = await mysql.query(`SELECT * FROM conceptos_gastos WHERE id_usuarios = ? ORDER BY id_conceptos_gastos DESC`, decoded.id)
                const conceptosgastos = conceptosG.map(concepto => {
                    return {
                        active: (concepto.c_activo ? true : false),
                        description: concepto.c_concepto_gasto,
                        id: concepto.id_conceptos_gastos
                    }
                });

                const [grupos] = await mysql.query(`SELECT * FROM grupos_gastos WHERE id_usuarios = ? ORDER BY id_grupo_gasto desc`, [decoded.id]);
                const conceptosgrupos = grupos.map(grupo => {
                    return {
                        id: grupo.id_grupo_gasto + '/' + (grupo.gr_tarjeta_credito !== 1 ? 2 : 1),
                        description: grupo.gr_tipo_grupo,
                        isCreditCard: (grupo.gr_tarjeta_credito !== 1 ? 2 : 1),
                        corte: (grupo.gr_tarjeta_credito == 1 ? Number(grupo.gr_tarjeta_fcorte) : null),
                        conteo: 0,
                        active: (grupo.gr_activo ? true : false)
                    }
                })

                const indicators = {
                    ingresos: {
                        id: 1,
                        title: 'Ingresos',
                        backgroundColor: '#5CBCFB',
                        percentage: (calculo[0].porcentaje_i ? calculo[0].porcentaje_i : 38),
                        total: parseFloat(calculo[0].monto_ingresos ? calculo[0].monto_ingresos : "0.00").toFixed(2)
                    },
                    gastos: {
                        id: 2,
                        title: 'Gastos',
                        backgroundColor: '#F3DC54',
                        percentage: (calculo[0].porcentaje_g ? calculo[0].porcentaje_g : 0),
                        total: parseFloat(calculo[0].monto_gastos ? calculo[0].monto_gastos : "0.00").toFixed(2)
                    },
                    balance: {
                        id: 3,
                        title: 'Balance',
                        backgroundColor: (calculo[0].balance >= 0 ? '#65AF39' : '#FF5733'),
                        percentage: (calculo[0].porcentaje_b ? calculo[0].porcentaje_b : "75"),
                        total: parseFloat(calculo[0].balance ? calculo[0].balance : "0.00").toFixed(2)
                    }
                };
                const arrayIndicators = Object.values(indicators);

                res.json({
                    status: 200,
                    response: {
                        idLastNotification: (notificaciones.length > 0 ? notificaciones[0].id_notificacion : null),
                        indicators: arrayIndicators,
                        utils: {
                            plazos: setPlazos,
                            conceptosIngresos: conceptosingresos,
                            conceptosGastos: conceptosgastos,
                            conceptosGrupos: conceptosgrupos
                        },
                    }
                })
            } else {
                res.json({
                    status: 500,
                    response: {
                        text: "Token Invalido"
                    }
                })
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