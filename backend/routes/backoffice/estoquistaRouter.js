const express = require('express');
const router = express.Router();
const ProdutoController = require('../../controllers/backoffice/ProdutoController');
const { exigirLogin, exigirEstoquista } = require('../../middleware/sessionsMiddleware');

router.get('/', exigirLogin, exigirEstoquista, (req, res) => {
    res.render('backoffice/estoquista/index', { title: 'Painel do Estoquista' });
});



router.get('/listar-produtos', exigirLogin, exigirEstoquista, (req, res) => {
    res.render('backoffice/estoquista/listar-produtos');
});
router.get('/listar-produtos/api', exigirLogin, exigirEstoquista, ProdutoController.listarProdutosAPI);

module.exports = router;
