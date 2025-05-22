const express = require('express');
const router = express.Router();
const EstoquistaController = require('../../controllers/backoffice/EstoquistaController');
const { exigirLogin, exigirEstoquista } = require('../../middleware/sessionsMiddleware');

router.get('/', exigirLogin, exigirEstoquista, (req, res) => {
    res.render('backoffice/estoquista/index', { title: 'Painel do Estoquista' });
});

router.get('/listar-produtos', exigirLogin, exigirEstoquista, (req, res) => {
    res.render('backoffice/estoquista/listar-produtos');
});
router.get('/listar-pedidos', exigirLogin, exigirEstoquista, EstoquistaController.listarPedidos);
router.post('/alterar-status-pedido', exigirLogin, exigirEstoquista, EstoquistaController.alterarStatusPedido);

router.get('/listar-produtos/api', exigirLogin, exigirEstoquista, EstoquistaController.listarProdutosAPI);
router.get('/listar-pedidos', exigirLogin, exigirEstoquista, EstoquistaController.listarPedidos);

router.get('/alterar-produto/:produto_id', exigirLogin, exigirEstoquista, EstoquistaController.renderizarPaginaAlterarProduto);
router.post('/alterar-produto/:produto_id', exigirLogin, exigirEstoquista, EstoquistaController.alterarProduto);
router.get('/produto/:produto_id', exigirLogin, exigirEstoquista, EstoquistaController.getProdutoDetalhes);
router.post('/alterar-produto/:produto_id', exigirLogin, exigirEstoquista, EstoquistaController.alterarProduto);


module.exports = router;
