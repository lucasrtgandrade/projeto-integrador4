const express = require('express');
const router = express.Router();

const ProdutoController = require('../../controllers/backoffice/ProdutoController');
const CarrinhoController = require('../../controllers/CarrinhoController');
const FreteController = require('../../controllers/FreteController'); // ✅ importante

// Página de detalhes do produto
router.get('/produto/:id', ProdutoController.renderizarPaginaDetalhesProduto);

// Página do carrinho
router.get('/carrinho', CarrinhoController.exibirCarrinho);

// Adicionar item ao carrinho
router.post('/api/carrinhos/:carrinho_id/itens', CarrinhoController.adicionarItem);

// Atualizar quantidade
router.put('/api/carrinhos/:carrinho_id/itens/:item_id', CarrinhoController.atualizarQuantidadeItem);

// Remover item
router.delete('/api/carrinhos/:carrinho_id/itens/:item_id', CarrinhoController.removerItem);

// ✅ Rota para frete
router.get('/api/frete', FreteController.listarOpcoes);

module.exports = router;
