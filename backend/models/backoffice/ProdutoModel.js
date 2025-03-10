const pool = require('../../db');

class ProdutoModel {
    static async listarProdutos(pagina = 1, limite = 10, termoPesquisa = '') {
        const offset = (pagina - 1) * limite;

        // Base query to fetch products (remove the status filter)
        let query = `
            SELECT produto_id, nome, descricao, CAST(preco AS DECIMAL(10,2)) as preco, qtd_estoque, status
            FROM produtos
            WHERE 1=1
        `;

        // Count query to get the total number of products (remove the status filter)
        let queryContagem = `
            SELECT COUNT(*) as total FROM produtos
            WHERE 1=1
        `;

        // Add search filter if a search term is provided
        if (termoPesquisa) {
            query += ` AND nome LIKE ?`;
            queryContagem += ` AND nome LIKE ?`;
        }

        // Add sorting by produto_id in descending order (newest first)
        query += ` ORDER BY produto_id DESC`;

        // Add pagination
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

    // Insert a new product
    static async cadastrarProduto(nome, descricao, preco, qtd_estoque) {
        const [result] = await pool.query(
            'INSERT INTO produtos (nome, descricao, preco, qtd_estoque, status) VALUES (?, ?, ?, ?, ?)',
            [nome, descricao, preco, qtd_estoque, 1] // Status 1 = Ativo
        );
        return result.insertId; // Return the ID of the newly inserted product
    }

    // Insert a product rating
    static async cadastrarAvaliacao(produtoId, avaliacao) {
        await pool.query(
            'INSERT INTO avaliacoes (avaliacao, produto_id) VALUES (?, ?)',
            [avaliacao, produtoId]
        );
    }

    // Insert product images
    static async cadastrarImagens(produtoId, imagens, imagemPrincipalIndex) {
        if (!Array.isArray(imagens)) {
            throw new Error('Imagens devem ser um array');
        }

        for (let i = 0; i < imagens.length; i++) {
            const isPrincipal = i === imagemPrincipalIndex; // Check if this is the main image
            await pool.query(
                'INSERT INTO imagens (url, is_principal, produto_id) VALUES (?, ?, ?)',
                [imagens[i].filename, isPrincipal, produtoId]
            );
        }
    }

    // Toggle product status
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
}

module.exports = ProdutoModel;