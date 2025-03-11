const pool = require('../../config/db');

class ProdutoModel {
    static async listarProdutos(pagina = 1, limite = 10, termoPesquisa = '') {
        const offset = (pagina - 1) * limite;

        // Base query to fetch products (remove the status filter)
        let query = `
            SELECT produto_id, nome, descricao, CAST(preco AS DECIMAL(10,2)) as preco, qtd_estoque, status
            FROM produtos
            WHERE 1=1
        `;

        let queryContagem = `
            SELECT COUNT(*) as total FROM produtos
            WHERE 1=1
        `;


        if (termoPesquisa) {
            query += ` AND nome LIKE ?`;
            queryContagem += ` AND nome LIKE ?`;
        }


        query += ` ORDER BY produto_id DESC`;


        query += ` LIMIT ? OFFSET ?`;

        // Execute the queries
        const [produtos] = await pool.query(query, termoPesquisa ? [`%${termoPesquisa}%`, limite, offset] : [limite, offset]);
        const [total] = await pool.query(queryContagem, termoPesquisa ? [`%${termoPesquisa}%`] : []);

        return {
            produtos,
            total: total[0].total,
            pagina,
            limite,
            totalPaginas: Math.ceil(total[0].total / limite)
        };
    }

    static async cadastrarProduto(nome, descricao, preco, qtd_estoque) {
        const [result] = await pool.query(
            'INSERT INTO produtos (nome, descricao, preco, qtd_estoque, status) VALUES (?, ?, ?, ?, ?)',
            [nome, descricao, preco, qtd_estoque, 1] // Status 1 = Ativo
        );
        return result.insertId; // Return the ID of the newly inserted product
    }

    static async cadastrarAvaliacao(produtoId, avaliacao) {
        await pool.query(
            'INSERT INTO avaliacoes (avaliacao, produto_id) VALUES (?, ?)',
            [avaliacao, produtoId]
        );
    }

    static async cadastrarImagens(produtoId, imagens, imagemPrincipalIndex) {
        if (!Array.isArray(imagens)) {
            throw new Error('Imagens devem ser um array');
        }

        for (let i = 0; i < imagens.length; i++) {
            const isPrincipal = i === parseInt(imagemPrincipalIndex); // Check if this is the main image
            const nomeArquivo = imagens[i]; // Make sure this stores the filename, not the whole file object!

            await pool.query(
                'INSERT INTO imagens (url, is_principal, produto_id) VALUES (?, ?, ?)',
                [nomeArquivo, isPrincipal, produtoId]
            );
        }
    }

    static async alternarStatus(produtoId, status) {
        await pool.query(
            'UPDATE produtos SET status = ? WHERE produto_id = ?',
            [status, produtoId]
        );
    }

    static async buscarProdutoPorId(produtoId) {
        try {
            const [produto] = await pool.query(
                'SELECT produto_id, nome, descricao, preco, qtd_estoque FROM produtos WHERE produto_id = ?',
                [produtoId]
            );
            return produto[0]; // Return the first (and only) product
        } catch (error) {
            console.error('Erro ao buscar produto por ID:', error);
            throw error;
        }
    }

    // Update a product
    static async alterarProduto(produtoId, nome, descricao, preco, qtd_estoque) {
        try {
            await pool.query(
                'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, qtd_estoque = ? WHERE produto_id = ?',
                [nome, descricao, preco, qtd_estoque, produtoId]
            );
        } catch (error) {
            console.error('Erro ao alterar produto:', error);
            throw error;
        }
    }

    static async alterarAvaliacao(produtoId, avaliacao) {
        await pool.query(
            'UPDATE avaliacoes SET avaliacao = ? WHERE produto_id = ?',
            [avaliacao, produtoId]
        );
    }

    static async alterarImagem(produtoId, novoNome) {
        await pool.query(
            'UPDATE imagens SET url = ? WHERE produto_id = ? AND is_principal = TRUE',
            [novoNome, produtoId]
        );
    }

    static async buscarImagensPorProduto(produtoId) {
        const [imagens] = await pool.query(
            'SELECT imagem_id, url, is_principal FROM imagens WHERE produto_id = ?',
            [produtoId]
        );
        return imagens;
    }

    static async atualizarImagemPrincipal(produtoId, imagemId) {
        // Set all images to not be principal
        await pool.query(
            'UPDATE imagens SET is_principal = FALSE WHERE produto_id = ?',
            [produtoId]
        );

        // Set the selected image as principal
        await pool.query(
            'UPDATE imagens SET is_principal = TRUE WHERE imagem_id = ?',
            [imagemId]
        );
    }

    static async cadastrarNovaImagem(produtoId, nomeArquivo) {
        await pool.query(
            'INSERT INTO imagens (url, is_principal, produto_id) VALUES (?, FALSE, ?)',
            [nomeArquivo, produtoId]
        );
    }

}

module.exports = ProdutoModel;