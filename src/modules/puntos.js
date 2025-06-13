
const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const boom = require('@hapi/boom');

const { catchError } = require('../helpers/errorHelper');

const { setPunto, getPuntos, updatePunto, updatePrioridad, updateStatus } = require('../models/puntos');

const router = express.Router();
router.use(express.json());

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/', async(req, res) => {

    try {
        const { zone, latitude, longitude } = req.body

        if(!zone) throw boom.badRequest('La zona es necesaria')
        if(!latitude) throw boom.badRequest('La latitud es necesaria')
        if(!longitude) throw boom.badRequest('La longitud es necesaria')

        // await setPointDb({
        //     zone,
        //     latitude,
        //     longitude
        // })
    } catch (error) {
        const { status, message } = catchError(error)
        res.status(status).json({ message })
    }

})

router.post('/xls', upload.single('file'), async(req, res) => {
    try {
        const file = req.file
        if (!file) throw boom.badRequest('El archivo es necesario')

        if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && file.mimetype !== 'application/vnd.ms-excel') {
            throw boom.badRequest('El archivo no es un xls o xlsx')
        }

        const workbook = xlsx.read(file.buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]

        const data = xlsx.utils.sheet_to_json(sheet)

        const puntosDB = await getPuntos()

        for(const point of data) {
            if(!point.id || !point.zona || !point.latitud || !point.longitud) {
                throw boom.badRequest('El archivo no tiene la estructura correcta')
            }
            const isPoint = puntosDB.find(punto => punto.clave == point.id)
            if(isPoint) {
                await updatePunto({
                    id: isPoint.id,
                    clave: point.id,
                    zona: point.zona,
                    latitud: parseFloat(point.latitud.trim()),
                    longitud: parseFloat(point.longitud.trim())
                })
            } else {
                await setPunto({
                    clave: point.id,
                    zona: point.zona,
                    latitud: parseFloat(point.latitud.trim()),
                    longitud: parseFloat(point.longitud.trim())
                })
            }
        }
        res.status(200).json({ message: `${data.length} Puntos agregados correctamente` })
    } catch (error) {
        const { status, message } = catchError(error)
        res.status(status).json({ message })
    }
})

router.put('/priority', async(req, res) => {
    try {
        const { id, priority } = req.body
        if (!id) throw boom.badRequest('El id es necesario')

        await updatePrioridad(id, priority || 0)
        res.status(200).json({ message: "Actualizado correctamente" })
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

router.delete('/:id', async(req, res) => {
    try {
        const { id } = req.params
        if (!id) throw boom.badRequest('El id es necesario')

        await updateStatus(id, 0)
        res.status(200).json({ message: "Eliminado correctamente" })
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

router.post('/:id', async(req, res) => {
    try {
        const { id } = req.params
        if (!id) throw boom.badRequest('El id es necesario')

        await updateStatus(id, 1)
        res.status(200).json({ message: "Actualizado correctamente" })
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

module.exports = router;