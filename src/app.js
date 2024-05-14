import express from 'express'
import indexRoutes from './routes/index.routes.js'

const app = express()
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json())
app.use(indexRoutes)

app.use((req, res, next) => {
    res.status(404).json({
        message: `Endpoint not found`
    })
})

export default app