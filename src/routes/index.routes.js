import { Router } from "express"
import path from 'path'
import { writeFile } from 'fs/promises';

import { hola, ping, generateToken, validateToken } from "../controllers/index.controller.js"
import { getMensajes } from "../controllers/welcome.controller.js"
import { authLogin } from "../controllers/auth.controller.js"
import { getGroupsByUser, addGroupsByUser, editGroupsByUser, updateGroupsStatusByUser, deleteGroupsByUser } from "../controllers/groups.controller.js"
import { getUsuario, addUsuario, editUsuario, deleteUsuario } from "../controllers/usuarios.controller.js"
import { getConceptosByUser, addConceptosByUser, editConceptosByUser, deleteConceptosByUser, updateConceptosStatusByUser } from "../controllers/conceptos.gastos.controller.js"
import { getConceptosIngresosByUser, addConceptosIngresosByUser, editConceptosIngresosByUser, deleteConceptosIngresosByUser, updateConceptosStatusIngresosByUser} from "../controllers/conceptos.ingresos.controller.js"
import { getIngresosByUser, addIngresosByUser, editIngresosByUser, deleteIngresosByUser } from "../controllers/ingresos.controller.js"
import { dashboard } from "../controllers/dashboard.controller.js";


const router = Router()
//test
router.get('/hola', hola)
router.get('/ping', ping)
router.get('/generarToken', generateToken)
router.get('/validarToken', validateToken)

//dashboard
router.post('/dashboard', dashboard)
router.get('/uploads/:file', (req, res) => {
    const absolutePath = path.resolve('uploads', req.params.file);
    res.sendFile(absolutePath);
})

router.post('/uploadFile', async (req, res) => {
    const uploadsDir = path.resolve('uploads');
    const file = req.body.file.split(';base64,').pop();
    try {
        await writeFile(path.join(uploadsDir, req.body.nombre_file), file, 'base64');
        res.json({
            status: 200,
            response: {
                text: 'Se ha cargado el documento correctamente'
            }
        })
    } catch (error) {
        res.json({
            status: 400,
            response: {
                text: 'Ha ocurrido un error, intente nuevamente'
            }
        })
    }
})

//welcome 
router.post('/welcome/mensajes', getMensajes)

//auth
router.post('/auth/login', authLogin)

//grupos
router.post('/catalogos/grupos', getGroupsByUser)
router.post('/catalogos/grupos/add', addGroupsByUser)
router.post('/catalogos/grupos/edit', editGroupsByUser)
router.post('/catalogos/grupos/estatus/edit', updateGroupsStatusByUser)
router.post('/catalogos/grupos/delete', deleteGroupsByUser)

//conceptos gastos
router.post('/catalogos/conceptos/gastos', getConceptosByUser)
router.post('/catalogos/conceptos/gastos/add', addConceptosByUser)
router.post('/catalogos/conceptos/gastos/edit', editConceptosByUser)
router.post('/catalogos/conceptos/gastos/estatus/edit', updateConceptosStatusByUser)
router.post('/catalogos/conceptos/gastos/delete', deleteConceptosByUser)

//conceptos gastos
router.post('/catalogos/conceptos/ingresos', getConceptosIngresosByUser)
router.post('/catalogos/conceptos/ingresos/add', addConceptosIngresosByUser)
router.post('/catalogos/conceptos/ingresos/edit', editConceptosIngresosByUser)
router.post('/catalogos/conceptos/ingresos/estatus/edit', updateConceptosStatusIngresosByUser)
router.post('/catalogos/conceptos/ingresos/delete', deleteConceptosIngresosByUser)

//usuarios
router.post('/usuario', getUsuario)
router.post('/usuario/add', addUsuario)
router.post('/usuario/edit', editUsuario)
router.post('/usuario/delete', deleteUsuario)

//ingresos
router.post('/ingresos', getIngresosByUser);
router.post('/ingresos/add', addIngresosByUser)
router.post('/ingresos/edit', editIngresosByUser)
router.post('/ingresos/delete', deleteIngresosByUser)

export default router