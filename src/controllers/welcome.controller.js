import { mysql } from "../db/db.js"

export const getMensajes = async (req, res) => {
    try {
        const [row] = await mysql.query(`SELECT * FROM mensajes_bienvenida WHERE mb_activo ORDER BY mb_orden`)
        const mensajes = row.map(mensaje => {
            return {
                id: mensaje.id_mensajes_bienvenida, 
                text: mensaje.mb_descripcion
            }
        })
        res.json({
            status: 200,
            response: mensajes
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
