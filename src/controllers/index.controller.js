import { mysql } from "../db/db.js"
import jwt from 'jsonwebtoken'
import { SECRET_KEY } from "../config.js"

export const hola = async (req, res) => {
    res.json({
        status: 200,
        response: {
            text: 'Hola mundazo'
        },
    })
}

export const ping = async (req, res) => {
    const [result] = await mysql.query("SELECT NOW()")
    res.json(result[0])
}

export const generateToken = async (req, res) => {
    const userData = {
        id: 123,
        username: 'usuarioejemplo',
        role: 'usuario'
    }

    const token = jwt.sign(userData, SECRET_KEY, { expiresIn: '1h' })
    res.json(token)
}

export const validateToken = async (req, res) => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ10.eyJpZCI6MTIzLCJ1c2VybmFtZSI6InVzdWFyaW9lamVtcGxvIiwicm9sZSI6InVzdWFyaW8iLCJpYXQiOjE3MTIyNjkyNTUsImV4cCI6MTcxMjI3Mjg1NX0.tLCaI-f2FVDqboiwRr3RO1nvDNOQzR0CjMvaXha4mXI'
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        res.json({
            status: (!err ? 200 : 404),
            response: (err ? err.message : 'Token Valido'),
        })
    })
}
