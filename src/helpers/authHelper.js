
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { format } = require('date-fns');
const JWT_SECRET = 'SECRETO_DE_LA_APP';
const SALT_ROUNDS = 13;



const encriptarContrasena = async (contrasena) => {
    try {
        return await bcrypt.hash(contrasena, SALT_ROUNDS)
    } catch (error) {
        console.error('Error al encriptar contraseña', error)
        return null
    }
}
const compararContrasena = async (contrasena, contrasenaEncriptada) => {
    try {
        return await bcrypt.compare(contrasena, contrasenaEncriptada)
    } catch (error) {
        console.error('Error al comparar contraseñas', error)
        return null
    }
}
const generarJWT = (payload, secret, expiresIn) => {
    return jwt.sign(payload, secret, {
        expiresIn: expiresIn,
    })
}
const generarToken = (payload, expriresIn = 3600) => {
    let expiresIn = expriresIn || 3600

    const token = generarJWT(payload, JWT_SECRET, expiresIn)
    const date = new Date()
    date.setSeconds(date.getSeconds() + expiresIn)

    return {
        token,
        expriresIn: format(date, 'yyyy-MM-dd HH:mm:ss')
    }
}

const validarToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch (error) {
        throw new Error(error)
    }
}

module.exports = {
    encriptarContrasena,
    compararContrasena,
    generarToken,
    validarToken
}


