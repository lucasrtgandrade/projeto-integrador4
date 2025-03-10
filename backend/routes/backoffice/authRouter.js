const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/backoffice/authController');

router.get('/', AuthController.renderizarPaginaLogin);

router.post('/login', AuthController.loginBackOffice);

module.exports = router;