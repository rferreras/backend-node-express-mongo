var express = require('express');
var app = express();

var Medico = require('../models/medico');
var mdAutentication = require('../middlewares/autentication');


// ====================================================
// OBTERNER TODOS LOS MEDICOS
// ====================================================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    result: false,
                    mensaje: 'Error en Base de datos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    result: true,
                    medicos: medicos,
                    conteo: conteo
                });
            });
        });

});

// ====================================================
// CREAR UN NUEVO MEDICO
// ====================================================
app.post('/', mdAutentication.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoDb) => {
        if (err) {
            return res.status(400).json({
                result: false,
                mensaje: 'Error creando Medico',
                errors: err
            });
        }

        res.status(201).json({
            result: true,
            medico: medicoDb,
            usuarioToken: req.usuario
        });

    });
});

// ====================================================
// ACTUALIZAR MEDICO
// ====================================================
app.put('/:id', mdAutentication.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                result: false,
                mensaje: 'Error Medico no encontrado',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                result: false,
                mensaje: 'Error Medico con el ID ' + id + ' no existe',
                errors: err
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital._id;

        medico.save((err, medicoDb) => {
            if (err) {
                return res.status(400).json({
                    result: false,
                    mensaje: 'Error actualizando el medico',
                    errors: err
                });
            }

            res.status(201).json({
                result: true,
                medico: medicoDb
            });
        });

    });
});

// ====================================================
// ELIMINAR UN MEDICO
// ====================================================
app.delete('/:id', mdAutentication.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                result: false,
                mensaje: 'Error Medico no encontrado',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                result: false,
                mensaje: 'Error Medico con el ID ' + id + ' no existe',
                errors: { message: 'El medico no ha sido encontrado en la base de datos' }
            });
        }

        res.status(200).json({
            result: true,
            medico: medicoBorrado
        });
    });

});

module.exports = app;