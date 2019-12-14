var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var app = express();
var Usuario = require('../models/usuario');

var SEED = require('../config/config').SEED;

// GOOGLE
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ====================================================
// LOGIN DEL USUARIO NORMAL
// ====================================================
app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                result: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                result: false,
                mensaje: 'Credenciales no validas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                result: false,
                mensaje: 'Credenciales no validas - password',
                errors: { mensaje: 'Credenciales no validas' }
            });
        }

        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            result: true,
            usuarioDB: usuarioDB,
            token: token
        });
    });
});

// ====================================================
// LOGIN DEL USUARIO POR GOOGLE
// ====================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });

    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                result: false,
                mensaje: 'Token no valido',
                errors: { mensaje: 'Token no valido' }
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                result: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    result: false,
                    mensaje: 'Debe de usar su autentificacion normal'
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                res.status(200).json({
                    result: true,
                    usuarioDB: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        } else {
            // EL USUARIO NO EXISTE HAY QUE CREARLO

            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        result: false,
                        mensaje: 'Error al buscar usuarios',
                        errors: err
                    });
                }

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                res.status(200).json({
                    result: true,
                    usuarioDB: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });

            });

        }


    });

})


module.exports = app;