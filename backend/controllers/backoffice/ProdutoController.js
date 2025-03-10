const ProdutoModel = require('../../models/backoffice/ProdutoModel');

class ProdutoController {
    static async buscarDadosProdutos(page = 1, limit = 10, search = '') {
        try {
            const result = await ProdutoModel.listarProdutos(page, limit, search);

            // Converte o preço de string para número
            const produtos = result.produtos.map(produto => ({
                ...produto,
                preco: Number(produto.preco) // Converte preco para número
            }));

            return {
                produtos, // Produtos com preço convertido
                paginaAtual: result.pagina,
                totalPaginas: result.totalPaginas,
                termoPesquisa: search
            };
        } catch (error) {
            console.error('Erro ao buscar dados dos produtos:', error);
            throw error;
        }
    }

    static async renderizarPaginaListarProdutos(req, res) {
        const { page = 1, limit = 10, search = '' } = req.query;

        try {
            const dadosProdutos = await ProdutoController.buscarDadosProdutos(page, limit, search);

            res.render('backoffice/administrador/listar-produtos', {
                title: 'Listar Produtos',
                ...dadosProdutos // Espalha os dados no objeto de renderização
            });
        } catch (error) {
            console.error('Erro ao renderizar a página de produtos:', error);
            res.status(500).send('Erro ao carregar a página de produtos');
        }
    }

    static async listarProdutosAPI(req, res) {
        const { pagina = 1, limite = 10, termoPesquisa = '' } = req.query;

        try {
            const resultado = await ProdutoModel.listarProdutos(pagina, limite, termoPesquisa);
            res.json(resultado); // Return JSON data
        } catch (erro) {
            console.error('Erro ao listar produtos:', erro);
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar produtos' });
        }
    }

    static renderizarPaginaCadastrarProduto(req, res) {
        res.render('backoffice/administrador/cadastrar-produto', {
            title: 'Cadastrar Produto'
        });
    }

    static async cadastrarProduto(req, res) {
        const { nome, descricao, preco, qtd_estoque, avaliacao, imagem_principal } = req.body;
        const imagens = req.files; // Uploaded files

        if (!nome || !descricao || !preco || !qtd_estoque || !avaliacao || !imagens || !imagem_principal) {
            return res.status(400).send('Todos os campos são obrigatórios');
        }

        try {
            // Step 1: Insert the product into the database
            const produtoId = await ProdutoModel.cadastrarProduto(nome, descricao, preco, qtd_estoque);

            // Step 2: Insert the product rating into the `avaliacoes` table
            await ProdutoModel.cadastrarAvaliacao(produtoId, avaliacao);

            // Step 3: Insert the images into the database
            await ProdutoModel.cadastrarImagens(produtoId, imagens, imagem_principal);

            // Redirect to the product list page
            res.redirect('/backoffice/administrador/listar-produtos');
        } catch (error) {
            console.error('Erro ao cadastrar produto:', error);
            res.status(500).send('Erro ao cadastrar produto');
        }
    }

    static async alternarStatusProduto(req, res) {
        const { produto_id } = req.params;
        const { status } = req.body;

        try {
            // Toggle the status in the database
            await ProdutoModel.alternarStatus(produto_id, status);

            // Return a success response
            res.json({ sucesso: true, novoStatus: status });
        } catch (error) {
            console.error('Erro ao alternar status do produto:', error);
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao alternar status do produto' });
        }
    }

    static async renderizarPaginaAlterarProduto(req, res) {
        const { produto_id } = req.params;

        try {
            const produto = await ProdutoModel.buscarProdutoPorId(produto_id);
            res.render('backoffice/administrador/alterar-produto', { produto });
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            res.status(500).send('Erro ao carregar a página de alteração de produto');
        }
    }

    static async alterarProduto(req, res) {
        const { produto_id } = req.params;
        const { nome, descricao, preco, qtd_estoque } = req.body;

        try {
            // Update the product in the model
            await ProdutoModel.alterarProduto(produto_id, nome, descricao, preco, qtd_estoque);

            // Return a success response
            res.json({ sucesso: true });
        } catch (error) {
            console.error('Erro ao alterar produto:', error);
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao alterar produto' });
        }
    }

}

module.exports = ProdutoController;