const express = require('express');
const bodyParser = require('body-parser');
const { encriptarContrasena } = require('./src/helpers/authHelper');
const app = express();
const port = 3000;
const routes = require('./src/modules/index');
routes(app)

//----------Logeo-----------------------------



//--------------------------------------------

// Configuración de la conexión a la base de datos
const { connection, queryAsync } = require('./src/conexion')

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.json());


// Endpoint para obtener datos de la base de datos
app.get('/datos', (req, res) => {
    connection.query('SELECT * FROM ciudad', (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            res.status(500).send('Error en la consulta');
            return;
        }
        res.json(results);
    });
});

// Ciudad
app.post('/guardar', (req, res) => {
    const { campo1} = req.body;
    const query = 'INSERT INTO ciudad (nombre) VALUES (?)';
    connection.query(query, [campo1], (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            res.status(500).send('Error en la consulta');
            return;
        }
        res.json({ mensaje: 'Datos guardados exitosamente' });
    });
});

// Usuario
app.post('/usuarios', async(req, res) => {
    const { campo1, campo2, campo3, campo4, campo5, campo6, campo7, rol} = req.body;

    //Buscar conincidencias en la cedula
    const consulta = 'SELECT * FROM usuarios WHERE Cedula = ?';
    const resultado = await queryAsync(consulta, [campo1]);
    if(resultado.length > 0){
        return res.status(400).json({ mensaje: 'Ya existe un usuario con esta cedula' });
    }
    //Buscar conincidencias en el correo
    const consultaCorreo = 'SELECT * FROM usuarios WHERE correo = ?';
    const resultadoCorreo = await queryAsync(consultaCorreo, [campo6]);
    if(resultadoCorreo.length > 0){
        return res.status(400).json({ mensaje: 'Ya existe un usuario con este correo' });
    }

    const contrasenaEncriptada = await encriptarContrasena(campo7);

    const query = 'INSERT INTO usuarios (Cedula, nombre, edad, ciudad, telefono, correo, contrasena, fk_rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [campo1, campo2, campo3, campo4, campo5, campo6, contrasenaEncriptada, rol], (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            res.status(500).send('Error en la consulta');
            return;
        }
        res.json({ mensaje: 'Datos guardados exitosamente' });
    });
});
 
// Vehiculo
app.post('/vehiculo', (req, res) => {
    const { campo1, campo2, campo3, campo4, campo5, campo6, campo7, campo8} = req.body;
    const query = 'INSERT INTO vehiculo (tipo, marca, codigo, color, anio, placa, carga, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [campo1, campo2, campo3, campo4, campo5, campo6, campo7, campo8], (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            res.status(500).send('Error en la consulta');
            return;
        }
        res.json({ mensaje: 'Datos guardados exitosamente' });
    });
});

// Horario

app.post('/horario', (req, res) => {
    const { campo1, campo2} = req.body;
    const query = 'INSERT INTO horario (nombre, horas) VALUES (?, ?)';
    connection.query(query, [campo1, campo2], (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            res.status(500).send('Error en la consulta');
            return;
        }
        res.json({ mensaje: 'Datos guardados exitosamente' });
    });
});
// Ruta
app.post('/ruta', (req, res) => {
    const { campo1, campo2, campo3, campo4} = req.body;
    const query = 'INSERT INTO ruta (nombre, descripcion, tiempo, distancia) VALUES (?, ?, ?, ?)';
    connection.query(query, [campo1, campo2, campo3, campo4], (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            res.status(500).send('Error en la consulta');
            return;
        }
        res.json({ mensaje: 'Datos guardados exitosamente' });
    });
});
// Roles

app.post('/tipo', (req, res) => {
    const { campo1} = req.body;
    const query = 'INSERT INTO roles (rol) VALUES (?)';
    connection.query(query, [campo1], (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            res.status(500).send('Error en la consulta');
            return;
        }
        res.json({ mensaje: 'Datos guardados exitosamente' });
    });
});
// Zona
app.post('/zona', (req, res) => {
    const { campo1, campo2, campo3} = req.body;
    const query = 'INSERT INTO zona (nombre, descripcion, area) VALUES (?, ?, ?)';
    connection.query(query, [campo1, campo2, campo3], (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            res.status(500).send('Error en la consulta');
            return;
        }
        res.json({ mensaje: 'Datos guardados exitosamente' });
        
    });
});



//ELIMINAR DATOS
app.post('/eliminar', (req, res) => {
    const { id_horario } = req.body;

    if (!id_horario) {
        return res.status(400).json({ message: 'Por favor, proporciona un ID de horario válido.' });
    }

    // Ejecutar la consulta DELETE
    const sql = `DELETE FROM Horario WHERE id_horario = ?`;
    connection.query(sql, [id_horario], (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            return res.status(500).json({ message: 'Ocurrió un error al eliminar el horario' });
        }
        if (result.affectedRows > 0) {
            res.json({ message: `Horario con ID ${id_horario} eliminado correctamente.` });
        } else {
            res.json({ message: `No se encontró un horario con ID ${id_horario}.` });
        }
    });
});


//CIUDAD
app.post('/Ciudad_eliminar', (req, res) => {
    const { id_ciudad } = req.body;

    if (!id_ciudad) {
        return res.status(400).json({ message: 'Por favor, proporciona un ID de Ciudad válido.' });
    }

    // Ejecutar la consulta DELETE
    const sql = `DELETE FROM Ciudad WHERE id_ciudad = ?`;
    connection.query(sql, [id_ciudad], (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            return res.status(500).json({ message: 'Ocurrió un error al eliminar la Ciudad' });
        }
        if (result.affectedRows > 0) {
            res.json({ message: `Ciudad con ID ${id_ciudad} eliminado correctamente.` });
        } else {
            res.json({ message: `No se encontró una Ciudad con ID ${id_ciudad}.` });
        }
    });
});



//RUTA
app.post('/Ruta_eliminar', (req, res) => {
    const { id_ruta } = req.body;

    if (!id_ruta) {
        return res.status(400).json({ message: 'Por favor, proporciona un ID de Ruta válido.' });
    }

    // Ejecutar la consulta DELETE
    const sql = `DELETE FROM Ruta WHERE id_ruta = ?`;
    connection.query(sql, [id_ruta], (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            return res.status(500).json({ message: 'Ocurrió un error al eliminar Ruta' });
        }
        if (result.affectedRows > 0) {
            res.json({ message: `Ruta con ID ${id_ruta} eliminado correctamente.` });
        } else {
            res.json({ message: `No se encontró una Ciudad con ID ${id_ruta}.` });
        }
    });
});

//ROLES
app.post('/Rol_eliminar', (req, res) => {
    const { id_roles } = req.body;

    if (!id_roles) {
        return res.status(400).json({ message: 'Por favor, proporciona un ID de Rol válido.' });
    }

    // Ejecutar la consulta DELETE
    const sql = `DELETE FROM Roles WHERE id_roles = ?`;
    connection.query(sql, [id_roles], (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            return res.status(500).json({ message: 'Ocurrió un error al eliminar Rol' });
        }
        if (result.affectedRows > 0) {
            res.json({ message: `Rol con ID ${id_roles} eliminado correctamente.` });
        } else {
            res.json({ message: `No se encontró un Rol con ID ${id_roles}.` });
        }
    });
});

//CEDULA
app.post('/Usuario_eliminar', (req, res) => {
    const { Cedula } = req.body;

    if (!Cedula) {
        return res.status(400).json({ message: 'Por favor, proporciona una Cedula válida.' });
    }

    // Ejecutar la consulta DELETE
    const sql = `DELETE FROM Usuarios WHERE Cedula = ?`;
    connection.query(sql, [Cedula], (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            return res.status(500).json({ message: 'Ocurrió un error al eliminar Usuario' });
        }
     


        if (result.affectedRows > 0) {
            res.json({ message: `Usuario con Cedula ${Cedula} eliminado correctamente.` });
        } else {
            res.json({ message: `No se encontró un Usuario con esta cedula ${Cedula}.` });
        }
    });
});


//VEHICULO
app.post('/Vehiculo_eliminar', (req, res) => {
    const { id_vehiculo } = req.body;

    if (!id_vehiculo) {
        return res.status(400).json({ message: 'Por favor, proporciona una ID válida.' });
    }

    // Ejecutar la consulta DELETE
    const sql = `DELETE FROM Vehiculo WHERE id_vehiculo = ?`;
    connection.query(sql, [id_vehiculo], (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            return res.status(500).json({ message: 'Ocurrió un error al eliminar Vehiculo' });
        }
        if (result.affectedRows > 0) {
            res.json({ message: `Vehiculo con ID ${id_vehiculo} eliminado correctamente.` });
        } else {
            res.json({ message: `No se encontró un Vehiculo con esta ID ${id_vehiculo}.` });
        }
    });
});


//ZONA
app.post('/Zona_eliminar', (req, res) => {
    const { id_zona } = req.body;

    if (!id_zona) {
        return res.status(400).json({ message: 'Por favor, proporciona una ID válida.' });
    }

    // Ejecutar la consulta DELETE
    const sql = `DELETE FROM Zona WHERE id_zona = ?`;
    connection.query(sql, [id_zona], (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            return res.status(500).json({ message: 'Ocurrió un error al eliminar Zona' });
        }
        if (result.affectedRows > 0) {
            res.json({ message: `Zona con ID ${id_zona} eliminado correctamente.` });
        } else {
            res.json({ message: `No se encontró una Zona con esta ID ${id_zona}.` });
        }
    });
});



// MOSTRAR DATOS 
//HORARIO
app.get('/verhorario', (req, res) => {
    const sql = 'SELECT id_horario, nombre, horas FROM horario';
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).send('Error al obtener los datos');
        }
        res.json(results);
    });
});

//CIUDAD
app.get('/verciudad', (req, res) => {
    const sql = 'SELECT id_ciudad, nombre FROM ciudad';
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).send('Error al obtener los datos');
        }
        res.json(results);
    });
});

//VEHICULO
app.get('/vervehiculo', (req, res) => {
    const sql = 'SELECT id_vehiculo, tipo, marca, codigo, color, anio, placa, carga, estado FROM vehiculo';
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).send('Error al obtener los datos');
        }
        res.json(results);
    });
});

//RUTA
app.get('/verruta', (req, res) => {
    const sql = 'SELECT id_ruta, nombre, descripcion, tiempo, distancia FROM ruta';
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).send('Error al obtener los datos');
        }
        res.json(results);
    });
});

//ROL
app.get('/verroles', (req, res) => {
    const sql = 'SELECT id_roles, rol FROM roles';
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).send('Error al obtener los datos');
        }
        res.json(results);
    });
});


//USUARIO
app.get('/verusuarios', (req, res) => {
    const sql = 'SELECT usuarios.cedula, usuarios.nombre, usuarios.edad, usuarios.ciudad, usuarios.telefono, usuarios.correo, roles.rol FROM usuarios JOIN roles ON usuarios.fk_rol = roles.id_roles WHERE usuarios.estado = "activo";';
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).send('Error al obtener los datos');
        }
        res.json(results);
    });
});

//ZONA

app.get('/verzona', (req, res) => {
    const sql = 'SELECT id_zona, nombre, descripcion, area FROM Zona';
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).send('Error al obtener los datos');
        }
        res.json(results);
    });
});


//----------------------  VIAJES -----------------------//
app.get('/verviajes', (req, res) => {
    const sql = 'SELECT id, distancia_total, tiempo_viaje_total, tiempo_servicio_total, zona, conductor, camion, auxs, turno, creacion FROM viajes';
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).send('Error al obtener los datos');
        }

        const viajesConvertidos = results.map(viaje => ({
            ...viaje,
            distancia_total: parseFloat((viaje.distancia_total / 1000).toFixed(2)),           // kilómetros
            tiempo_viaje_total: parseFloat((viaje.tiempo_viaje_total / 60).toFixed(2)),       // minutos
            tiempo_servicio_total: parseFloat((viaje.tiempo_servicio_total / 60).toFixed(2))  // minutos
        }));

        res.json(viajesConvertidos);
    });
});


// OPTENER A LOS AUXILIARES

app.get('/auxiliares', (req, res) => {
    const sql = 'SELECT nombre FROM usuarios WHERE rol = "auxiliar"';
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).send('Error al obtener los datos');
        }
        const nombres = results.map(row => row.nombre);
        res.json(nombres);
    });
});


//------------------------------------------------------------

//EDITAR

// Ruta para obtener un usuario por cédula
app.get('/obtener-usuario/:cedula', (req, res) => {
    const { cedula } = req.params;
    const query = 'SELECT * FROM usuarios WHERE cedula = ?';
    connection.query(query, [cedula], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.send(result[0]); // Retorna el registro encontrado
        } else {
            res.status(404).send({ message: 'Usuario no encontrado' });
        }
    });
});
//actualizar
// Ruta para actualizar un usuario por cédula
app.put('/editar-usuario/:cedula', async(req, res) => {
    const { cedula } = req.params;
    const { nombre, edad, ciudad, telefono, correo, contrasena, rol } = req.body;
    if (contrasena === '') {
        const query = 'UPDATE usuarios SET nombre = ?, edad = ?, ciudad = ?, telefono = ?, correo = ?, fk_rol = ? WHERE cedula = ?';
        connection.query(query, [nombre, edad, ciudad, telefono, correo, rol, cedula], (err, result) => {
            if (err) throw err;

            if (result.affectedRows > 0) {
                res.send({ message: 'Usuario actualizado con éxito' });
            } else {
                res.status(404).send({ message: 'Usuario no encontrado' });
            }
        });
    } else {
        const contrasenaEncriptada = await encriptarContrasena(contrasena);

        const query = 'UPDATE usuarios SET nombre = ?, edad = ?, ciudad = ?, telefono = ?, correo = ?, contrasena = ?, fk_rol = ? WHERE cedula = ?';
        connection.query(query, [nombre, edad, ciudad, telefono, correo, contrasenaEncriptada, rol, cedula], (err, result) => {
            if (err) throw err;

            if (result.affectedRows > 0) {
                res.send({ message: 'Usuario actualizado con éxito' });
            } else {
                res.status(404).send({ message: 'Usuario no encontrado' });
            }
        });

    }
});




//---------------------------------Limpiar registro de zonas --------------------------//



// Ruta para ejecutar las consultas
app.post('/truncate-data', (req, res) => {
    const queries = [
      `SET FOREIGN_KEY_CHECKS = 0;`,
      `TRUNCATE TABLE viaje_rutas_rel;`,
      `TRUNCATE TABLE rutas;`,
      `TRUNCATE TABLE viajes;`,
      `SET FOREIGN_KEY_CHECKS = 1;`
    ];
  
    // Ejecuta las consultas secuencialmente
    queries.forEach((query, index) => {
      connection.query(query, (err) => {
        if (err) {
          console.error(`Error en la consulta ${index + 1}:`, err);
          return res.status(500).json({ error: 'Error al ejecutar las consultas.' });
        }
        console.log(`Consulta ${index + 1} ejecutada correctamente.`);
      });
    });
  
    res.json({ message: 'Operación terminada' });
  });



//----------------------------------Ruta para ejecutar las consultas-------------------------//
app.post('/delete-data', (req, res) => {
    const queries = [
      `DELETE viaje_rutas_rel FROM viaje_rutas_rel
       INNER JOIN viajes on viajes.id = viaje_rutas_rel.fk_viaje 
       WHERE viajes.zona = 'test';`,
      `DELETE viajes FROM viajes WHERE zona = 'test';`,
      `DELETE rutas FROM rutas 
       INNER JOIN puntos on puntos.id = rutas.fk_punto 
       WHERE puntos.zona = 'test';`,
      `DELETE puntos FROM puntos WHERE zona = 'test';`
    ];
  
    // Ejecuta las consultas secuencialmente
    queries.forEach((query, index) => {
      connection.query(query, (err, results) => {
        if (err) {
          console.error(`Error en la consulta ${index + 1}:`, err);
          return res.status(500).json({ error: 'Error al ejecutar las consultas.' });
        }
        console.log(`Consulta ${index + 1} ejecutada. Filas afectadas:`, results.affectedRows);
      });
    });
  
    res.json({ message: 'Consultas ejecutadas correctamente.' });
  });

//----------------------------Olvido su contraseña
const bcrypt = require('bcrypt');
app.post('/recuperar-contrasena', (req, res) => {
    const { correo } = req.body;
  
    // Verifica si el correo existe en la base de datos
    connection.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, result) => {
      if (err) return res.status(500).send('Error en la base de datos');
      if (result.length === 0) return res.status(404).send('Usuario no encontrado');
  
      // Genera un token único
      const token = crypto.randomBytes(20).toString('hex');
      const fechaExpiracion = moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'); // Expiración en 1 hora
  
      // Guarda el token en la base de datos con fecha de expiración
      connection.query('INSERT INTO recuperacion_contrasena (cedula, token, fecha_expiracion) VALUES (?, ?, ?)', 
        [result[0].cedula, token, fechaExpiracion], (err) => {
          if (err) return res.status(500).send('Error al generar el token');
  
          // Enviar el token al usuario, aquí puede ser un enlace o el token en texto
          res.send(`Su código de recuperación es: ${token}`);
        });
    });
  });



  app.post('/cambiar-contrasena', (req, res) => {
    const { token, nuevaContrasena } = req.body;
  
    // Verifica si el token es válido y no ha expirado
    connection.query('SELECT * FROM recuperacion_contrasena WHERE token = ?', [token], (err, result) => {
      if (err) return res.status(500).send('Error en la base de datos');
      if (result.length === 0) return res.status(404).send('Token inválido');
  
      // Verifica si el token ha expirado
      const fechaExpiracion = moment(result[0].fecha_expiracion);
      if (fechaExpiracion.isBefore(moment())) {
        return res.status(400).send('El token ha expirado');
      }
  
      // Hashea la nueva contraseña y actualiza en la base de datos
      const contrasenaHasheada = bcrypt.hashSync(nuevaContrasena, 10);
      connection.query('UPDATE usuarios SET contrasena = ? WHERE cedula = ?', 
        [contrasenaHasheada, result[0].cedula], (err) => {
          if (err) return res.status(500).send('Error al actualizar la contrasena');
          
          // Elimina el token de la base de datos
          connection.query('DELETE FROM recuperacion_contrasena WHERE token = ?', [token], (err) => {
            if (err) return res.status(500).send('Error al eliminar el token');
            
            res.send('Contraseña cambiada exitosamente');
          });
        });
    });
  });
  
//-----------------------------------------Olvido su contraseña
// Generar código temporal
function generateTempCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Endpoint: Enviar código de recuperación
app.post('/api/send-reset-code', async (req, res) => {
    const { correo } = req.body;

    try {
        const users = await queryAsync('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Correo no registrado' });
        }

        const tempCode = generateTempCode();
        const expiration = new Date(Date.now() + 300000); // 15 minutos

        await queryAsync(
            'UPDATE usuarios SET codigo_temporal = ?, expiracion_codigo = ? WHERE correo = ?',
            [tempCode, expiration, correo]
        );

        res.json({ 
            success: true, 
            message: 'Código enviado',
            tempCode: tempCode // Enviar código al frontend
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Endpoint: Restablecer contraseña
app.post('/api/reset-password', async (req, res) => {
    const { correo, codigo, nuevaContraseña } = req.body;

    try {
        if (!nuevaContraseña || nuevaContraseña.trim() === '') {
            return res.status(400).json({ success: false, message: 'La contraseña no puede estar vacía' });
        }

        const users = await queryAsync(
            'SELECT * FROM usuarios WHERE correo = ? AND codigo_temporal = ? AND expiracion_codigo > NOW()',
            [correo, codigo]
        );

        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Código inválido o expirado' });
        }

        const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);
        
        await queryAsync(
            'UPDATE usuarios SET contrasena = ?, codigo_temporal = NULL, expiracion_codigo = NULL WHERE correo = ?',
            [hashedPassword, correo]
        );

        res.json({ success: true, message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Endpoint de Login
app.post('/api/login', async (req, res) => {
    const { correo, password } = req.body;

    try {
        const users = await queryAsync('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const match = await bcrypt.compare(password, users[0].contrasena);
        
        if (!match) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        res.json({ success: true, message: 'Login exitoso' });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});


//-------------------------  Habilitar /Inabilitar usuario -------------------------
// Obtener solo usuarios activos
app.get('/usuarios', (req, res) => {
    connection.query('SELECT cedula, nombre, estado FROM usuarios WHERE estado = "activo"', (err, results) => {
      if (err) return res.status(500).send('Error al obtener usuarios');
      res.json(results);
    });
  });
  
  // Obtener todos los usuarios (opcional)
  app.get('/usuarios/todos', (req, res) => {
    connection.query('SELECT cedula, nombre, estado FROM usuarios', (err, results) => {
      if (err) return res.status(500).send('Error al obtener todos los usuarios');
      res.json(results);
    });
  });
  
  // Inhabilitar usuario
  app.put('/usuarios/inhabilitar/:cedula', (req, res) => {
    const cedula = req.params.cedula;
    connection.query('UPDATE usuarios SET estado = "inactivo" WHERE cedula = ?', [cedula], (err) => {
      if (err) return res.status(500).send('Error al inhabilitar usuario');
      res.send('Usuario inhabilitado correctamente');
    });
  });
  
  // Habilitar usuario
  app.put('/usuarios/habilitar/:cedula', (req, res) => {
    const cedula = req.params.cedula;
    connection.query('UPDATE usuarios SET estado = "activo" WHERE cedula = ?', [cedula], (err) => {
      if (err) return res.status(500).send('Error al habilitar usuario');
      res.send('Usuario habilitado correctamente');
    });
  });
  
  // Login con validación de estado
  app.post('/login', (req, res) => {
    const { correo, contraseña } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE correo = ? AND estado = "activo"';
    connection.query(sql, [correo], (err, results) => {
      if (err) return res.status(500).send('Error en la base de datos');
      if (results.length === 0) return res.status(401).send('Usuario no encontrado o inhabilitado');
  
      const usuario = results[0];
  
      if (usuario.contraseña !== contraseña) {
        return res.status(401).send('Contraseña incorrecta');
      }
  
      res.json({ mensaje: 'Login exitoso', usuario });
    });
  });
  


// Servir archivos estáticos (tu frontend)
app.use(express.static('public'));
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});



