const ProdutoModel = require('../models/backoffice/ProdutoModel');
const {request} = require("express");

class PaginaInicialController {
    static async renderizarPaginaInicial(req, res) {
        try {
            // Fetch products for the home page
            const { produtos } = await ProdutoModel.listarProdutosParaHome(1, 10, ''); // Fetch first 10 products

            // Render the home page with the products
            res.render('index', {
                title: 'Página Inicial',
                produtos: produtos, // Pass products to the view
                usuario: req.session.user
            });
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            res.status(500).send('Erro ao carregar a página inicial');
        }
    }

    static async renderizarPaginaDetalhesProduto(req, res) {
        const { id } = req.params;

        try {
            const produto = await ProdutoModel.buscarProdutoComImagens(id);

            if (!produto) {
                return res.status(404).send('Produto não encontrado.');
            }

            // Render the product details page
            res.render('produto-detalhes', {
                title: `Detalhes do Produto - ${produto.nome}`,
                produto: produto,
                usuario: req.session.user
            });
        } catch (error) {
            console.error('Erro ao carregar página de detalhes:', error);
            res.status(500).send('Erro ao carregar página de detalhes.');
        }
    }
}

module.exports = PaginaInicialController;