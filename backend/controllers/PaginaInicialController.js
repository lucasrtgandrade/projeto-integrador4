const ProdutoModel = require('../models/backoffice/ProdutoModel');
const CarrinhoModel = require('../models/CarrinhoModel');

class PaginaInicialController {
    static async renderizarPaginaInicial(req, res) {
        try {
            const { produtos } = await ProdutoModel.listarProdutosParaHome(1, 10, '');
            res.render('index', {
                title: 'Página Inicial',
                produtos: produtos, // Pass products to the view
                user: req.session.user || null, // Pass user data if logged in
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

    static async postarClienteCarrinho(req, res) {
        const idSessao = req.session.id;
        try {
            const postarSessao = await CarrinhoModel.postarSessao(idSessao);
            res.json({success: true, id_carrinho: postarSessao.insertId});
        } catch (err) {
            console.error('Erro ao criar carrinho:', err);
            res.status(500).json({success: false, error: 'Erro ao criar carrinho'});
        }
    }
}

module.exports = PaginaInicialController;