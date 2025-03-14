const ProdutoModel = require('../../models/backoffice/ProdutoModel');

class EstoquistaController {
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

    static async renderizarPaginaAlterarProduto(req, res) {
        const { produto_id } = req.params;

        try {
            const produto = await ProdutoModel.buscarProdutoPorId(produto_id);
            const imagens = await ProdutoModel.buscarImagensPorProduto(produto_id);

            if (!produto) {
                return res.status(404).send('Produto não encontrado');
            }

            res.render('backoffice/estoquista/alterar-produto', { produto, imagens });
        } catch (error) {
            console.error('Erro ao carregar produto:', error);
            res.status(500).send('Erro ao carregar produto');
        }
    }

    static async alterarProduto(req, res) {
        const { produto_id } = req.params;
        const { qtd_estoque } = req.body;

        try {
            console.log("🔄 Atualizando estoque do produto ID:", produto_id, "Nova quantidade:", qtd_estoque);

            await ProdutoModel.alterarEstoque(produto_id, qtd_estoque);

            res.json({ sucesso: true, mensagem: "Estoque atualizado com sucesso!" });
        } catch (error) {
            console.error("❌ Erro ao alterar estoque:", error);
            res.status(500).json({ sucesso: false, mensagem: "Erro ao alterar estoque" });
        }
    }

    static async alterarEstoque(produto_id, qtd_estoque) {
        try {
            const query = 'UPDATE produtos SET qtd_estoque = ? WHERE produto_id = ?';
            await pool.query(query, [qtd_estoque, produto_id]);
            return true;
        } catch (error) {
            console.error("Erro ao atualizar estoque:", error);
            throw error;
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
                qtd_estoque: produto.qtd_estoque,
                media_avaliacao: produto.media_avaliacao, // ✅ Fix: Include the rating field
                imagens
            });
        } catch (error) {
            console.error("Erro ao buscar detalhes do produto:", error);
            res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar detalhes do produto" });
        }
    }



}

module.exports = EstoquistaController;
