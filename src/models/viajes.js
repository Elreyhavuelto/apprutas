const { queryAsync } = require('../conexion');

const TABLA = 'viajes';

const setViaje = async ({distanciaTotal, viajeTotal, servicioTotal, zona, conductor, camion, auxs, turno}) => {
    const query = `INSERT INTO ${TABLA} (distancia_total, tiempo_viaje_total, tiempo_servicio_total, zona, conductor, camion, auxs, turno) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    return await queryAsync(query, [distanciaTotal, viajeTotal, servicioTotal, zona, conductor, camion, auxs, turno]);
}

const getViajesByZona = async (zona) => {
    const query = `select * from ${TABLA} where zona = ?;`;
    const params = [zona];
    return await queryAsync(query, params);
}

const getViajesById = async (id) => {
    const query = `select * from ${TABLA} where id = ?;`;
    const params = [id];
    const resultado = await queryAsync(query, params);
    return resultado[0];
}

module.exports = {
    setViaje,
    getViajesByZona,
    getViajesById
}