const express = require('express');
const authRouter = require('./auth');
const puntoRouter = require('./puntos');
const rutaRouter = require('./rutas');

const routes = (app) => {
    const router = express.Router()
    app.use('/', router)
    router.use('/auth', authRouter)
    router.use('/puntos', puntoRouter)
    router.use('/rutas', rutaRouter)
};

module.exports = routes;