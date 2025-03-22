const express = require('express');
const router = express.Router();
const PaginaInicialController = require('../controllers/PaginaInicialController');

// Rota para a página inicial
router.get('/', PaginaInicialController.renderizarPaginaInicial);

module.exports = router;