var express = require('express');
var bcrypt = require('bcrypt');

var app = express();

var Usuario = require('../models/usuario');
var mdAutentication = require('../middlewares/autentication');

// ====================================================
// OBTERNER TODOS LOS USUARIOS
// ====================================================
app.get('/', (req, res) => {

    Usuario.find({}, 'nombre email img role')
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    result: false,
                    mensaje: 'Error en Base de datos',
                    errors: err
                });
            }

            res.status(200).json({
                result: true,
                usuarios: usuarios
            });

        });

});

// ====================================================
// CREAR UN NUEVO USUARIO
// ====================================================
app.post('/', mdAutentication.verificaToken, (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioDb) => {
        if (err) {
            return res.status(400).json({
                result: false,
                mensaje: 'Error creando usuario',
                errors: err
            });
        }

        res.status(201).json({
            result: true,
            usuario: usuarioDb,
            usuarioToken: req.usuario
        });

    });

});

// ====================================================
// ACTUALIZAR USUARIO
// ====================================================
app.put('/:id', mdAutentication.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                result: false,
                mensaje: 'Error Usuario no encontrado',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                result: false,
                mensaje: 'Error Usuario con el ID ' + id + ' no existe',
                errors: err
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioDb) => {
            if (err) {
                return res.status(400).json({
                    result: false,
                    mensaje: 'Error actualizando el usuario',
                    errors: err
                });
            }

            usuarioDb.password = ':)';

            res.status(201).json({
                result: true,
                usuario: usuarioDb
            });
        });

    });
});

// ====================================================
// ELIMINAR UN USUARIO
// ====================================================
app.delete('/:id', mdAutentication.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                result: false,
                mensaje: 'Error Usuario no encontrado',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                result: false,
                mensaje: 'Error Usuario con el ID ' + id + ' no existe',
                errors: { message: 'El usuario no ha sido encontrado en la base de datos' }
            });
        }

        res.status(200).json({
            result: true,
            usuario: usuarioBorrado
        });
    });

});
module.exports = app;