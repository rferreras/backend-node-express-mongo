var express = require('express');
var app = express();

app.get('/', (req, res, next) => {
    res.status(200).json({
        result: true,
        mensaje: 'Peticion realizada con exito!!!'
    });
});

module.exports = app;