const express = require('express');
const router = express.Router();
const { validarCPFMiddleware } = require('../../middleware/cpfMiddleware');


const ProdutoController = require('../../controllers/backoffice/ProdutoController');
const CarrinhoController = require('../../controllers/CarrinhoController');
const FreteController = require('../../controllers/FreteController');
const ClienteController = require("../../controllers/ClienteController");

router.get('/produto/:id', ProdutoController.renderizarPaginaDetalhesProduto);

router.get('/carrinho', CarrinhoController.exibirCarrinho);

router.post('/api/carrinhos/:carrinho_id/itens', CarrinhoController.adicionarItem);

router.put('/api/carrinhos/:carrinho_id/itens/:item_id', CarrinhoController.atualizarQuantidadeItem);

router.delete('/api/carrinhos/:carrinho_id/itens/:item_id', CarrinhoController.removerItem);

router.get('/api/frete', FreteController.listarOpcoes);

router.get('/cadastro', ClienteController.renderizarPaginaCadastroCliente);

router.post('/cadastrar', validarCPFMiddleware, ClienteController.cadastrarCliente.bind(ClienteController));

router.get('/login', ClienteController.renderizarPaginaLogin);

router.get('/verificar-email', ClienteController.verificarEmailEmTempoReal);

router.get('/verificar-cpf', ClienteController.verificarCpfEmTempoReal);




module.exports = router;
