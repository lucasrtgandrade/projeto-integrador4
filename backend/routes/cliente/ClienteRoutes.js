const express = require('express');
const router = express.Router();
const checkoutMiddleware = require('../../middleware/checkoutMiddleware');
const { validarCPFMiddleware } = require('../../middleware/cpfMiddleware');
const { verificarClienteLogado } = require('../../middleware/sessionsMiddleware');

const ProdutoController = require('../../controllers/backoffice/ProdutoController');
const CarrinhoController = require('../../controllers/CarrinhoController');
const FreteController = require('../../controllers/FreteController');
const ClienteController = require("../../controllers/ClienteController");
const PedidoController = require("../../controllers/PedidoController");

router.get('/produto/:id', ProdutoController.renderizarPaginaDetalhesProduto);

router.get('/carrinho', CarrinhoController.exibirCarrinho);

router.post('/api/carrinho/:carrinho_id/itens', CarrinhoController.postarClienteCarrinho);

router.post('/api/pedidos/finalizar', PedidoController.finalizarPedido);

router.post('/api/carrinhos/:carrinho_id/itens', CarrinhoController.adicionarItem);

router.put('/api/carrinhos/:carrinho_id/itens/:item_id', CarrinhoController.atualizarQuantidadeItem);

router.delete('/api/carrinhos/:carrinho_id/itens/:item_id', CarrinhoController.removerItem);

router.get('/api/frete', FreteController.listarOpcoes);

router.get('/cadastro', ClienteController.renderizarPaginaCadastroCliente);

router.post('/cadastrar', validarCPFMiddleware, ClienteController.cadastrarCliente.bind(ClienteController));

router.get('/verificar-email', ClienteController.verificarEmailEmTempoReal);

router.get('/verificar-cpf', ClienteController.verificarCpfEmTempoReal);

router.get('/login', ClienteController.renderizarPaginaLogin);

router.post('/login', ClienteController.logar);

router.get('/home', ClienteController.renderizarHome);

router.post('/logout', ClienteController.logout);

router.get('/editar-perfil', verificarClienteLogado ,ClienteController.renderizarPaginaEditar);

router.put('/editar', ClienteController.atualizarCliente);

router.get('/adicionar-endereco', verificarClienteLogado, ClienteController.renderizarPaginaAdicionarEndereco);

router.post('/endereco', ClienteController.adicionarEnderecoEntrega);

router.get('/enderecos', ClienteController.listarEnderecosEntrega);

router.put('/enderecos/:id/padrao', ClienteController.definirEnderecoPadrao);

router.get('/checkout-endereco-entrega', ClienteController.renderizarPaginaCheckoutEndereco);

router.post('/pedidos/endereco' ,PedidoController.salvarEnderecoEntrega);

router.post('/pagamento/salvar', PedidoController.salvarFormaPagamento)

router.get('/listar-pedidos', PedidoController.listarPedidosCliente);

router.get('/pedido/:id', PedidoController.detalharPedido);

router.get('/detalhes-pedido/:id', PedidoController.mostrarDetalhesPedido);

router.get('/checkout-pagamentos/:idPedido',PedidoController.renderizarPaginaPagamentos);

router.get('/checkout-resumo', PedidoController.renderizarPaginaResumoPedido);

router.post('/concluir-compra/:id_pedido', PedidoController.concluirCompra);

router.get('/listar', PedidoController.listarPedidos);

module.exports = router;
