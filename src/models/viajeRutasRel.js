const { queryAsync } = require('../conexion');

const TABLA = 'viaje_rutas_rel';

const setViajeRutasRel = async (fkViaje, fksRutas) => {
    const values = fksRutas.map(id => `( ${id}, ${fkViaje} )`).join(', ');
    const query = `INSERT INTO ${TABLA} (fk_ruta, fk_viaje) VALUES ${values};`;
    return await queryAsync(query);
}

module.exports = {
    setViajeRutasRel
}