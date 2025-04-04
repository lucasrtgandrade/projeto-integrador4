const ProdutoModel = require('../models/backoffice/ProdutoModel');

class PaginaInicialController {
    static async renderizarPaginaInicial(req, res) {
        try {
            // Fetch products for the home page
            const { produtos } = await ProdutoModel.listarProdutosParaHome(1, 10, ''); // Fetch first 10 products

            // Render the home page with the products
            res.render('index', {
                title: 'Página Inicial',
                produtos: produtos, // Pass products to the view
                user: req.session.user || null // Pass user data if logged in
            });
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            res.status(500).send('Erro ao carregar a página inicial');
        }
    }

    static async renderizarPaginaDetalhesProduto(req, res) {
        const { id } = req.params;

        try {
            // Fetch product details and images
            const produto = await ProdutoModel.buscarProdutoComImagens(id);

            if (!produto) {
                return res.status(404).send('Produto não encontrado.');
            }

            // Render the product details page
            res.render('produto-detalhes', {
                title: `Detalhes do Produto - ${produto.nome}`,
                produto: produto,
                user: req.session.user || null // Pass user data if logged in
            });
        } catch (error) {
            console.error('Erro ao carregar página de detalhes:', error);
            res.status(500).send('Erro ao carregar página de detalhes.');
        }
    }
}

module.exports = PaginaInicialController;