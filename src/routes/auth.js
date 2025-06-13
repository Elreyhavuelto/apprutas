const express = require('express');
const { encriptarContrasena, compararContrasena, generarToken, validarToken } = require('../helpers/authHelper');
const { queryAsync } = require('../conexion');
const router = express.Router();

router.get('/login', async (req, res) => {
  const { correo, contrasena } = req.query;
  const query = `
    SELECT usu.nombre, usu.contrasena, rol.rol 
    FROM usuarios usu 
    INNER JOIN roles rol ON usu.fk_rol = rol.id_roles 
    WHERE usu.correo = ?
  `;
  const resultado = await queryAsync(query, [correo]);

  if (resultado.length === 0 || !(await compararContrasena(contrasena, resultado[0].contrasena))) {
    return res.status(403).json({ mensaje: 'Credenciales inválidas' });
  }

  const tokenData = generarToken({ correo });
  res.json({ ...tokenData, usuario: { nombre: resultado[0].nombre, rol: resultado[0].rol } });
});

router.get('/validar', async (req, res) => {
  const { token } = req.query;

  try {
    const payload = validarToken(token);
    const query = `
      SELECT usu.nombre, rol.rol 
      FROM usuarios usu 
      INNER JOIN roles rol ON usu.fk_rol = rol.id_roles 
      WHERE usu.correo = ?
    `;
    const resultado = await queryAsync(query, [payload.correo]);

    if (resultado.length === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.status(200).json({ usuario: { nombre: resultado[0].nombre, rol: resultado[0].rol } });
  } catch (e) {
    res.status(403).json({ mensaje: 'Token inválido o caducado' });
  }
});

module.exports = router;
