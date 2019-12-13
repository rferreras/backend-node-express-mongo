var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var mdAutentication = require('../middlewares/autentication');

// ====================================================
// OBTERNER TODOS LOS HOSPITALES
// ====================================================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    result: false,
                    mensaje: 'Error en Base de datos',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    result: true,
                    hospitales: hospitales,
                    conteo: conteo
                });
            });
        });

});

// ====================================================
// CREAR UN NUEVO HOSPITAL
// ====================================================
app.post('/', mdAutentication.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalDb) => {
        if (err) {
            return res.status(400).json({
                result: false,
                mensaje: 'Error creando hospital',
                errors: err
            });
        }

        res.status(201).json({
            result: true,
            hopsital: hospitalDb,
            usuarioToken: req.usuario
        });

    });
});

// ====================================================
// ACTUALIZAR HOSPITAL
// ====================================================
app.put('/:id', mdAutentication.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                result: false,
                mensaje: 'Error Hospital no encontrado',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                result: false,
                mensaje: 'Error Hospital con el ID ' + id + ' no existe',
                errors: err
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalDb) => {
            if (err) {
                return res.status(400).json({
                    result: false,
                    mensaje: 'Error actualizando el hospital',
                    errors: err
                });
            }

            res.status(201).json({
                result: true,
                hospital: hospitalDb
            });
        });

    });
});

// ====================================================
// ELIMINAR UN HOSPITAL
// ====================================================
app.delete('/:id', mdAutentication.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                result: false,
                mensaje: 'Error Hospital no encontrado',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                result: false,
                mensaje: 'Error Hospital con el ID ' + id + ' no existe',
                errors: { message: 'El hospital no ha sido encontrado en la base de datos' }
            });
        }

        res.status(200).json({
            result: true,
            hospital: hospitalBorrado
        });
    });

});

module.exports = app;