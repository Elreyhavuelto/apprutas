const { queryAsync } = require('../conexion');

const TABLA = 'vehiculo';

const getVehiculos = async () => {
    const query = `SELECT * FROM ${TABLA} where estado = 'Operativo' `;
    return await queryAsync(query);
}

module.exports = {
    getVehiculos
}