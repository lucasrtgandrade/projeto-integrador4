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

    static async buscarProdutoAtivoPorId(produtoId) {
        try {
            const [resultado] = await pool.query(
                'SELECT produto_id, nome, descricao, preco, qtd_estoque FROM produtos WHERE produto_id = ? AND status = 1',
                [produtoId]
            );
            return resultado[0] || null;
        } catch (error) {
            console.error('Erro ao buscar produto ativo por ID:', error);
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
            `SELECT imagem_id, url, is_principal 
         FROM imagens 
         WHERE produto_id = ? 
         ORDER BY is_principal DESC`, // Main image (is_principal = TRUE) comes first
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

    static async atualizarEstoque(produto_id, qtd_estoque) {
        const query = 'UPDATE produtos SET qtd_estoque = ? WHERE produto_id = ?';
        await pool.query(query, [qtd_estoque, produto_id]);
    }

    static async alterarEstoque(produtoId, qtdEstoque) {
        try {
            const query = 'UPDATE produtos SET qtd_estoque = ? WHERE produto_id = ?';
            await pool.query(query, [qtdEstoque, produtoId]);
            return true;
        } catch (error) {
            console.error("Erro ao atualizar estoque:", error);
            throw error;
        }
    }

    static async listarProdutosParaHome(pagina = 1, limite = 10, termoPesquisa = '') {
        const offset = (pagina - 1) * limite;

        // Base query to fetch products with their main image
        let query = `
        SELECT p.produto_id, p.nome, p.descricao, CAST(p.preco AS DECIMAL(10,2)) as preco, p.qtd_estoque, p.status,
               i.url as imagem_principal
        FROM produtos p
        LEFT JOIN imagens i ON p.produto_id = i.produto_id AND i.is_principal = TRUE
        WHERE p.status = 1
    `;

        let queryContagem = `
        SELECT COUNT(*) as total FROM produtos
        WHERE status = 1
    `;

        if (termoPesquisa) {
            query += ` AND p.nome LIKE ?`;
            queryContagem += ` AND nome LIKE ?`;
        }

        query += ` ORDER BY p.produto_id DESC`;
        query += ` LIMIT ? OFFSET ?`;

        // Execute the queries
        const [produtos] = await pool.query(query, termoPesquisa ? [`%${termoPesquisa}%`, limite, offset] : [limite, offset]);
        const [total] = await pool.query(queryContagem, termoPesquisa ? [`%${termoPesquisa}%`] : []);

        // Log the preco values for debugging
        console.log('Produtos:', produtos);

        // Add a default image if imagem_principal is null
        const produtosComImagens = produtos.map(produto => ({
            ...produto,
            imagens: produto.imagem_principal ? [{ url: produto.imagem_principal }] : [{ url: 'default-image.jpg' }] // Use a default image if no main image exists
        }));

        return {
            produtos: produtosComImagens,
            total: total[0].total,
            pagina,
            limite,
            totalPaginas: Math.ceil(total[0].total / limite)
        };
    }

    static async buscarProdutoComImagens(produtoId) {
        try {
            // Fetch product details
            const [produto] = await pool.query(
                `SELECT p.produto_id, p.nome, p.descricao, CAST(p.preco AS DECIMAL(10,2)) as preco, p.qtd_estoque, p.status
                 FROM produtos p
                 WHERE p.produto_id = ?`,
                [produtoId]
            );

            if (produto.length === 0) {
                return null; // Product not found
            }

            // Fetch associated images
            const [imagens] = await pool.query(
                `SELECT imagem_id, url, is_principal
             FROM imagens
             WHERE produto_id = ?`,
                [produtoId]
            );

            return {
                ...produto[0], // Spread product details
                imagens: imagens // Add images array
            };
        } catch (error) {
            console.error('Erro ao buscar produto com imagens:', error);
            throw error;
        }
    }

}

module.exports = ProdutoModel;