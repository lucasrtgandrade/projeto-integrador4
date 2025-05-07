// ✅ backend/controllers/CarrinhoController.js
const CarrinhoModel = require('../models/CarrinhoModel');
const ProdutoModel = require('../models/backoffice/ProdutoModel');

class CarrinhoController {
    static async adicionarItem(req, res) {
        const { carrinho_id } = req.params;
        const { produto_id, quantidade } = req.body;

        try {
            const produto = await ProdutoModel.buscarProdutoAtivoPorId(produto_id);
            if (!produto) {
                return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
            }

            await CarrinhoModel.adicionarItemAoCarrinho(carrinho_id, produto_id, quantidade);
            res.status(200).json({ sucesso: true, mensagem: 'Item adicionado ao carrinho com sucesso.' });
        } catch (erro) {
            console.error('Erro ao adicionar item ao carrinho:', erro);
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao adicionar item ao carrinho.' });
        }
    }

    static async exibirCarrinho(req, res) {
        const carrinhoId = req.session.idCarrinho;
        const usuario = req.session.user;

        try {
            const itens = await CarrinhoModel.listarItensDoCarrinho(carrinhoId);

            const totalGeral = itens.reduce((soma, item) => {
                return soma + (item.preco * item.quantidade);
            }, 0);

            res.render('carrinho', {
                carrinho_id: carrinhoId,
                itens,
                totalGeral,
                usuario
            });
        } catch (erro) {
            console.error('Erro ao exibir carrinho:', erro);
            res.status(500).send('Erro ao carregar o carrinho.');
        }
    }



    static async atualizarQuantidadeItem(req, res) {
        const { carrinho_id, item_id } = req.params;
        const { quantidade } = req.body;

        try {
            await CarrinhoModel.atualizarQuantidadeItem(item_id, carrinho_id, quantidade);
            res.status(200).json({ sucesso: true, mensagem: 'Quantidade atualizada com sucesso.' });
        } catch (erro) {
            console.error('Erro ao atualizar quantidade do item:', erro);
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar a quantidade.' });
        }
    }

    static async removerItem(req, res) {
        const { carrinho_id, item_id } = req.params;

        try {
            await CarrinhoModel.removerItemDoCarrinho(item_id, carrinho_id);
            res.status(200).json({ sucesso: true, mensagem: 'Item removido com sucesso.' });
        } catch (erro) {
            console.error('Erro ao remover item do carrinho:', erro);
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao remover item.' });
        }
    }

    static async postarClienteCarrinho(req, res) {
        const idSessao = req.session.id;
        const { produto_id, quantidade } = req.body;

        try {
            // 1. Cria o carrinho com o ID da sessão
            const resultadoCarrinho = await CarrinhoModel.postarSessao(idSessao);
            const novoIdCarrinho = resultadoCarrinho.insertId;

            // 2. Salva esse id_carrinho na session (para futuras ações)
            req.session.id_carrinho = novoIdCarrinho;

            // 3. Verifica se o produto existe
            const produto = await ProdutoModel.buscarProdutoAtivoPorId(produto_id);
            if (!produto) {
                return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
            }

            // 4. Adiciona o item ao carrinho recém criado
            await CarrinhoModel.adicionarItemAoCarrinho(novoIdCarrinho, produto_id, quantidade);

            // 5. Retorna resposta
            res.status(200).json({
                sucesso: true,
                mensagem: 'Carrinho criado e item adicionado com sucesso.',
                id_carrinho: novoIdCarrinho
            });

        } catch (err) {
            console.error('Erro ao criar carrinho e adicionar item:', err);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao criar carrinho e adicionar item.'
            });
        }
    }

}

module.exports = CarrinhoController;