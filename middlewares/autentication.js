var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// ====================================================
// VERIFICAR TOKEN
// ====================================================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                result: false,
                mensaje: 'Error decodificando el Token',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();
    });
}