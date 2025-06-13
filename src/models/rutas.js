const { queryAsync } = require('../conexion');

const TABLA = 'rutas';

const setRutas = async (datas) => {
    if (datas.length === 0) return;
    const values = datas.map(data => `( ${data.consecutivo}, '${data.hora_inicio}', '${data.hora_fin}', ${data.servicio}, ${data.distancia}, ${data.tiempo}, '${data.polylinea.replace(/\\/g, '\\\\')}', ${data.fk_punto})`).join(', ');
    const query = `INSERT INTO ${TABLA} (consecutivo, hora_inicio, hora_fin, servicio, distancia, tiempo, polylinea, fk_punto) VALUES ${values};`;

    try {
        const resultado = await queryAsync(query);

        console.log('Data inserted successfully');
        return datas.map((data, index) => ({ ...data, id: resultado.insertId + index }));
        return ids;
    } catch (error) {
        console.error(`Error inserting data: ${error}`);
        return [];
    }
};

const getRutasByViaje = async (id) => {
    const query = `select ru.* from ${TABLA} as ru
    Inner join viaje_rutas_rel as rel on ru.id = rel.fk_ruta
    Inner join viajes as vi on vi.id = rel.fk_viaje
    where vi.id = ?;`;
    const params = [id];
    return await queryAsync(query, params);
}

module.exports = {
    setRutas,
    getRutasByViaje
}
