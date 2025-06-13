const { queryAsync } = require('../conexion');

const TABLA = 'usuarios';

const getUsuariosByRol = async (rol) => {
    const query = `SELECT * FROM ${TABLA} u INNER JOIN roles r on r.id_roles = u.fk_rol where r.rol = '${rol}' AND u.estado = 'activo'`;
    return await queryAsync(query);
}

module.exports = {
    getUsuariosByRol
}