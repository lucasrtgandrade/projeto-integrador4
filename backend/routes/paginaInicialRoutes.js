const express = require('express');
const router = express.Router();
const PaginaInicialController = require('../controllers/PaginaInicialController');
const ProdutoController = require('../controllers/backoffice/ProdutoController');

// Rota para a página inicial
router.get('/', PaginaInicialController.renderizarPaginaInicial);
router.get('/:id', ProdutoController.buscarProdutoDetalhes);

module.exports = router;