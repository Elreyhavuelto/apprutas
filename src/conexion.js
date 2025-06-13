const mysql = require("mysql2");
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'mydb_rutas'
});
// Conectar a la base de datos
connection.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos');
});
const queryAsync = (consulta, params) => {
    return new Promise((resolve, reject) => {
        connection.query(consulta, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};
module.exports = {
    connection,
    queryAsync
};