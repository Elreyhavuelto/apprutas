const boom = require('@hapi/boom');

const catchError = (error) => {
    let message;
    let status;
    console.error(error);
    if (boom.isBoom(error)) {
        message = error.output.payload.message;
        status = error.output.statusCode;
    } else {
        message = error.message || "Error en el servidor";
        status = error.status || 500;
    }
    return {
        status,
        message
    };
};

module.exports = {
    catchError
};