const express = require('express');
const { encriptarContrasena, compararContrasena, generarToken, validarToken } = require('../helpers/authHelper');
const { queryAsync } = require('../conexion');
const router = express.Router();
router.use(express.json());
router.get('/obtenerInformacion', async (req, res) => {
    const consultaCiudad = 'SELECT * FROM ciudad';
    const ciudades = await queryAsync(consultaCiudad);

    const consultaRol = 'SELECT * FROM roles';
    const roles = await queryAsync(consultaRol);

    res.json({
        data: {
            ciudades,
            roles
        },
        mensaje: 'Información obtenida correctamente'
    });
});

router.get('/login', async (req, res) => {
    const { correo, contrasena } = req.query;

    if (!correo || !contrasena) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    // Modificar la consulta para incluir el filtro de 'estado' activo
    const consultaCorreo = `
        SELECT rol.rol, usu.contrasena, usu.correo, usu.estado 
        FROM roles rol 
        INNER JOIN usuarios usu 
        ON rol.id_roles = usu.fk_rol 
        WHERE usu.correo = ? AND usu.estado = 'activo';
    `;
    const resultadoCorreo = await queryAsync(consultaCorreo, [correo]);

    if (resultadoCorreo.length === 0) {
        return res.status(403).json({ mensaje: 'Usuario no encontrado o está inactivo' });
    }

    const usuario = resultadoCorreo[0];
    const contrasenaValida = await compararContrasena(contrasena, usuario.contrasena);

    if (!contrasenaValida) {
        return res.status(403).json({ mensaje: 'Usuario o contraseña incorrectos' });
    }

    // Generar token
    const data = generarToken({ correo: usuario.correo }, 3600);

    res.json({
        data: {
            ...data,
            rol: usuario.rol
        },
        mensaje: 'Usuario ingresó correctamente'
    });
});
router.post('/registro', async (req, res) => {
    try {
        const { cedula, nombre, edad, ciudad, telefono, correo, contrasena, confirmarContrasena, fkRol } = req.body;
        if (!correo || !contrasena || !confirmarContrasena || !nombre || !cedula || !fkRol) {
    
            return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
        }
        if(contrasena !== confirmarContrasena){
            return res.status(400).json({ mensaje: 'Las contraseñas no coinciden' });
        }
    
        //Buscar conincidencias en la cedula
        const consulta = 'SELECT * FROM usuarios WHERE Cedula = ?';
        const resultado = await queryAsync(consulta, [cedula]);
        if(resultado.length > 0){
            return res.status(400).json({ mensaje: 'Ya existe un usuario con esta cedula' });
        }
        //Buscar conincidencias en el correo
        const consultaCorreo = 'SELECT * FROM usuarios WHERE correo = ?';
        const resultadoCorreo = await queryAsync(consultaCorreo, [correo]);
        if(resultadoCorreo.length > 0){
            return res.status(400).json({ mensaje: 'Ya existe un usuario con este correo' });
        }
    
        // Encriptar contraseña
        const contrasenaEncriptada = await encriptarContrasena(contrasena);
    
        const insercion = 'INSERT INTO usuarios ( Cedula, nombre, edad, ciudad, telefono, correo, contrasena, fk_rol ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await queryAsync(insercion, [cedula, nombre, edad, ciudad, telefono, correo, contrasenaEncriptada, fkRol]);
        res.json({ mensaje: 'Usuario registrado correctamente' });

    }
    catch(error){
        res.status(400).json({mensaje: "error al crear usuario"})
    }
 
});


router.get('/validar', async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    try {
        validarToken(token);
        res.json({
            mensaje: 'Token válido'
        });
    } catch (error) {
        res.status(403).json({ mensaje: 'Token inválido o caducado' });
    }
});

module.exports = router;

const obtenerUsuarioDesdeToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    try {
        const datosToken = validarToken(token);
        const consulta = `
            SELECT usu.cedula, usu.nombre, usu.correo, rol.rol 
            FROM usuarios usu 
            INNER JOIN roles rol ON usu.fk_rol = rol.id_roles 
            WHERE usu.correo = ?`;
        const resultado = await queryAsync(consulta, [datosToken.correo]);

        if (resultado.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        req.usuario = resultado[0];
        next();
    } catch (error) {
        res.status(403).json({ mensaje: 'Token inválido o caducado' });
    }
};

router.get('/usuario-logeado', obtenerUsuarioDesdeToken, (req, res) => {
    res.json({
        mensaje: 'Usuario autenticado correctamente',
        usuario: req.usuario
    });
});
