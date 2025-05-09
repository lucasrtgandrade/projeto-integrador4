const ProdutoModel = require('../../models/backoffice/ProdutoModel');
const path = require('path');
const fs = require('fs');
const pool = require('../../config/db');

class ProdutoController {
    // Backoffice Methods
    static async buscarDadosProdutos(page = 1, limit = 10, search = '') {
        try {
            const result = await ProdutoModel.listarProdutos(page, limit, search);

            const produtos = result.produtos.map(produto => ({
                ...produto,
                preco: Number(produto.preco)
            }));

            return {
                produtos,
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
                ...dadosProdutos
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
            res.json(resultado);
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
        const imagens = req.files;

        if (!nome || !descricao || !preco || !qtd_estoque || !avaliacao || !imagens || !imagem_principal) {
            return res.status(400).send('Todos os campos são obrigatórios');
        }

        try {
            // Step 1: Insert the product into the database
            const produtoId = await ProdutoModel.cadastrarProduto(nome, descricao, preco, qtd_estoque);

            // Step 2: Insert the product rating into the `avaliacoes` table
            await ProdutoModel.cadastrarAvaliacao(produtoId, avaliacao);

            // Step 3: Rename and save images
            const imagensRenomeadas = imagens.map((imagem, index) => {
                const extensao = path.extname(imagem.originalname);
                const novoNome = `${nome.replace(/\s+/g, '-').toLowerCase()}-${produtoId}-${index + 1}${extensao}`;
                const novoCaminho = path.join(__dirname, '../../public/uploads', novoNome);

                fs.renameSync(imagem.path, novoCaminho);
                return novoNome;
            });

            // Step 4: Insert renamed images into the database
            await ProdutoModel.cadastrarImagens(produtoId, imagensRenomeadas, imagem_principal);

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
            await ProdutoModel.alternarStatus(produto_id, status);
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
            const imagens = await ProdutoModel.buscarImagensPorProduto(produto_id);

            res.render('backoffice/administrador/alterar-produto', { produto, imagens });
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            res.status(500).send('Erro ao carregar a página de alteração de produto');
        }
    }

    static async alterarProduto(req, res) {
        const { produto_id } = req.params;
        const { nome, descricao, preco, qtd_estoque, avaliacao, imagem_principal } = req.body;
        const novasImagens = req.files; // Uploaded files

        try {
            // Update product details
            await ProdutoModel.alterarProduto(produto_id, nome, descricao, preco, qtd_estoque);
            await ProdutoModel.alterarAvaliacao(produto_id, avaliacao);

            // Update the main image selection
            if (imagem_principal) {
                await ProdutoModel.atualizarImagemPrincipal(produto_id, imagem_principal);
            }

            // Handle new image uploads
            if (novasImagens && novasImagens.length > 0) {
                for (let i = 0; i < novasImagens.length; i++) {
                    const extensao = path.extname(novasImagens[i].originalname);
                    const novoNome = `${nome.replace(/\s+/g, '-').toLowerCase()}-${produto_id}-${i + 1}${extensao}`;
                    const novoCaminho = path.join(__dirname, '../../public/uploads', novoNome);

                    fs.renameSync(novasImagens[i].path, novoCaminho);

                    // Save new image to the database
                    await ProdutoModel.cadastrarNovaImagem(produto_id, novoNome);
                }
            }

            res.json({ sucesso: true });
        } catch (error) {
            console.error('Erro ao alterar produto:', error);
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao alterar produto' });
        }
    }

    static async getProdutoDetalhes(req, res) {
        const { produto_id } = req.params;

        try {
            const produto = await ProdutoModel.buscarProdutoPorId(produto_id);
            const imagens = await ProdutoModel.buscarImagensPorProduto(produto_id);

            if (!produto) {
                return res.status(404).json({ sucesso: false, mensagem: "Produto não encontrado" });
            }

            res.json({
                nome: produto.nome,
                media_avaliacao: produto.media_avaliacao, //
                qtd_estoque: produto.qtd_estoque,
                imagens
            });
        } catch (error) {
            console.error("Erro ao buscar detalhes do produto:", error);
            res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar detalhes do produto" });
        }
    }

    // Customer-Facing Methods
    static async listarProdutosParaHome(req, res) {
        const { page = 1, limit = 10, search = '' } = req.query;

        try {
            const { produtos, total, pagina, totalPaginas } = await ProdutoModel.listarProdutosParaHome(page, limit, search);

            res.render('cliente/index', {
                title: 'Página Inicial',
                produtos,
                total,
                pagina,
                totalPaginas,
                search
            });
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            res.status(500).send('Erro ao carregar a página inicial');
        }
    }

    static async buscarProdutoDetalhes(req, res) {
        const { id } = req.params;

        try {
            const produto = await ProdutoModel.buscarProdutoComImagens(id);

            if (!produto) {
                return res.status(404).json({ success: false, message: 'Produto não encontrado.' });
            }

            res.json({ success: true, produto });
        } catch (error) {
            console.error('Erro ao buscar detalhes do produto:', error);
            res.status(500).json({ success: false, message: 'Erro ao buscar detalhes do produto.' });
        }
    }

    static async renderizarPaginaDetalhesProduto(req, res) {
        const { id } = req.params;

        try {
            const produto = await ProdutoModel.buscarProdutoComImagens(id);

            if (!produto) {
                return res.status(404).send('Produto não encontrado.');
            }

            let carrinhoId = req.session.idCarrinho;
            if (!carrinhoId) {
                const [resultado] = await pool.query(
                    'INSERT INTO carrinhos (id_cliente_sessao) VALUES (?)',
                    [Date.now().toString()]
                );
                carrinhoId = resultado.insertId;
                req.session.idCarrinho = carrinhoId;
            }

            res.render('produto-detalhes', {
                produto,
                carrinho_id: carrinhoId
            });
        } catch (error) {
            console.error('Erro ao carregar página de detalhes:', error);
            res.status(500).send('Erro ao carregar página de detalhes.');
        }
    }
}

module.exports = ProdutoController;