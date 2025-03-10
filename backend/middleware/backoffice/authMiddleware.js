const { body, validationResult } = require('express-validator');

// Middleware to validate email
const validarEmail = (field) => {
    return [
        body(field)
            .trim()
            .isEmail()
            .withMessage('O campo "inputEmailColaborador" é obrigatório e deve ser um texto válido.'),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array()[0].msg });
            }
            next();
        }
    ];
};

// Export only the necessary middleware
module.exports = { validarEmail };
