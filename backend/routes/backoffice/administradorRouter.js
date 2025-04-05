const express = require('express');
const router = express.Router();
const AdministradorController = require('../../controllers/backoffice/AdministradorController');
const ProdutoController = require('../../controllers/backoffice/ProdutoController');
const { exigirLogin, exigirAdministrador } = require('../../middleware/sessionsMiddleware');
const { validarCPFMiddleware } = require('../../middleware/cpfMiddleware');
const validarSenhaMiddleware = require('../../middleware/senhaMiddleware');
const upload = require('../../config/multer');

router.get('/', exigirLogin, exigirAdministrador, AdministradorController.renderizarPaginaIndex);

router.get('/listar-colaboradores', exigirLogin, exigirAdministrador, AdministradorController.listarColaboradores);

router.post('/alterar-status-colaborador/:colaborador_id', exigirLogin, exigirAdministrador, AdministradorController.alterarStatusColaborador);

router.post('/alterar-colaborador/:colaborador_id', exigirLogin, exigirAdministrador, validarCPFMiddleware, validarSenhaMiddleware, AdministradorController.alterarColaborador);
router.get('/alterar-colaborador/:colaborador_id', exigirLogin, exigirAdministrador, AdministradorController.renderizarPaginaAlterarColaborador);

router.get('/cadastrar-colaborador', exigirLogin, exigirAdministrador, AdministradorController.renderizarPaginaCadastrarColaborador);
router.post('/cadastrar-colaborador', exigirLogin, exigirAdministrador, validarCPFMiddleware, validarSenhaMiddleware, AdministradorController.cadastrarColaborador);

router.get('/listar-produtos', exigirLogin, exigirAdministrador, ProdutoController.renderizarPaginaListarProdutos);
router.get('/listar-produtos/api', exigirLogin, exigirAdministrador, ProdutoController.listarProdutosAPI);

router.post('/alternar-status-produto/:produto_id', exigirLogin, exigirAdministrador, ProdutoController.alternarStatusProduto);

router.get('/cadastrar-produto', exigirLogin, exigirAdministrador, ProdutoController.renderizarPaginaCadastrarProduto);
router.post('/cadastrar-produto', exigirLogin, exigirAdministrador, upload.array('imagens'), ProdutoController.cadastrarProduto);

router.get('/alterar-produto/:produto_id', ProdutoController.renderizarPaginaAlterarProduto);
router.post('/alterar-produto/:produto_id', upload.single('novaImagem'), ProdutoController.alterarProduto);

router.get('/produto/:produto_id', exigirLogin, exigirAdministrador, ProdutoController.getProdutoDetalhes);


module.exports = router;
