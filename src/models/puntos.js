const { queryAsync } = require('../conexion');

const TABLA = 'puntos';

const getPuntos = async () => {
    const query = `SELECT * FROM ${TABLA}`;
    return await queryAsync(query);
}

const getPuntoById = async (id) => {
    const query = `SELECT * FROM ${TABLA} WHERE id = ? LIMIT 1`;
    return await queryAsync(query, [id]);
}

const getPuntosOrdenados = async (zona) => {
    const query = `SELECT * FROM ${TABLA} WHERE zona = ? ORDER BY prioridad`;
    return await queryAsync(query, [zona]);
}

const getPuntosByZona = async (zona) => {
    const query = `SELECT * FROM ${TABLA} WHERE zona = ?`;
    return await queryAsync(query, [zona]);
}

getPuntosByZonaNoIds = async (zona, ids) => {
    const query = `SELECT * FROM ${TABLA} WHERE zona = ? AND id NOT IN (?)`;
    return await queryAsync(query, [zona, ids]);
}

const setPunto = async ({ clave, zona, latitud, longitud, prioridad = 1 }) => {
    const query = `INSERT INTO ${TABLA} (clave, zona, latitud, longitud, prioridad, status) VALUES (?, ?, ?, ?, ? , ?)`;
    await queryAsync(query, [clave, zona, latitud, longitud, prioridad, 1]);
}

const updatePunto = async ({ id, clave, zona, latitud, longitud, prioridad = 1, status = 1 }) => {
    const query = `UPDATE ${TABLA} SET clave = ?, zona = ?, latitud = ?, longitud = ?, prioridad = ?, status = ? WHERE id = ?`;
    await queryAsync(query, [clave, zona, latitud, longitud, prioridad, status, id]);
}

const updatePrioridad = async (id, prioridad) => {
    const query = `UPDATE ${TABLA} SET prioridad = ? WHERE id = ?`;
    await queryAsync(query, [prioridad, id]);
}

const updateStatus = async (id, status) => {
    const query = `UPDATE ${TABLA} SET status = ? WHERE id = ?`;
    await queryAsync(query, [status, id]);
}

module.exports = {
    getPuntos,
    getPuntoById,
    getPuntosOrdenados,
    getPuntosByZona,
    getPuntosByZonaNoIds,
    setPunto,
    updatePunto,
    updatePrioridad,
    updateStatus
}