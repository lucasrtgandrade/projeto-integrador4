const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/backoffice/authController');

router.post('/login', AuthController.acessoBackOffice);

module.exports = router;