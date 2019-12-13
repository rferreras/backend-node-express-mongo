var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // TIPOS DE COLECCION DE ARCHIVOS
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            result: false,
            mensaje: 'Tipo de coleccion no valida',
            error: { message: 'Las colecciones solo pueden ser ' + tiposValidos.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            result: false,
            mensaje: 'No selecciono nada',
            error: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // OBTENER NOMBRE DEL ARCHIVO
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // EXTENSIONES QUE VAMOS A PERMITIR
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            result: false,
            mensaje: 'Extension no permitida',
            error: { message: 'Solo se permiten extensiones ' + extensionesValidas.join(', ') }
        });
    }

    // NOMBRE DE ARCHIVO PERSONALIZADO
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // MOVEMOS EL ARCHIVO DEL TEMPORAL A UN PATH ESPECIFICO
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, (err) => {
        if (err) {
            return res.status(400).json({
                result: false,
                mensaje: 'Error moviendo el archivo',
                error: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    });


});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (err || !usuario) {
                return res.status(400).json({
                    result: false,
                    mensaje: 'Usuario no existe en BD',
                    error: { message: 'El usuario no fue encontrado en la base de datos' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // SI EXISTE UN ARCHIVO YA ELIMINA LA IMAGEN ANTERIOR
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) {
                        return res.status(400).json({
                            result: false,
                            mensaje: 'Ha ocurrido un error intentando eliminar la imagen',
                            error: err
                        });
                    }
                });
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)'
                return res.status(200).json({
                    result: true,
                    mensaje: 'Imagen del usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });

    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (err || !medico) {
                return res.status(400).json({
                    result: false,
                    mensaje: 'Medico no existe en BD',
                    error: { message: 'El Medico no fue encontrado en la base de datos' }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // SI EXISTE UN ARCHIVO YA ELIMINA LA IMAGEN ANTERIOR
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) {
                        return res.status(400).json({
                            result: false,
                            mensaje: 'Ha ocurrido un error intentando eliminar la imagen',
                            error: err
                        });
                    }
                });
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    result: true,
                    mensaje: 'Imagen del medico actualizada',
                    usuario: medicoActualizado
                });
            });
        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (err || !hospital) {
                return res.status(400).json({
                    result: false,
                    mensaje: 'Hospital no existe en BD',
                    error: { message: 'El Hospital no fue encontrado en la base de datos' }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // SI EXISTE UN ARCHIVO YA ELIMINA LA IMAGEN ANTERIOR
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) {
                        return res.status(400).json({
                            result: false,
                            mensaje: 'Ha ocurrido un error intentando eliminar la imagen',
                            error: err
                        });
                    }
                });
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    result: true,
                    mensaje: 'Imagen del Hospital actualizada',
                    usuario: hospitalActualizado
                });
            });
        });
    }

}

module.exports = app;