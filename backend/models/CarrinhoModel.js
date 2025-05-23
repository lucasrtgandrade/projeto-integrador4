// ✅ backend/models/CarrinhoModel.js
const pool = require('../config/db');

class CarrinhoModel {
    static async criarCarrinhoParaSessao(idClienteSessao) {
        const [resultado] = await pool.query(
            'INSERT INTO carrinhos (id_cliente_sessao) VALUES (?)',
            [idClienteSessao]
        );
        return resultado.insertId;
    }

    static async postarSessao(idSessao) {
        const [resultado] = await pool.query(
            'INSERT INTO carrinhos (id_cliente_sessao) VALUES (?)',
            [idSessao]
        );
        return resultado;
    }

    static async buscarItensCarrinho(id_carrinho) {
        const sql = `
            SELECT
                ic.produto_id AS id_produto,
                ic.quantidade,
                p.preco AS preco_unitario
            FROM itens_carrinho ic
                     JOIN produtos p ON p.produto_id = ic.produto_id
            WHERE ic.id_carrinho = ?
        `;
        const [linhas] = await pool.query(sql, [id_carrinho]);
        return linhas;
    }

    static async adicionarItemAoCarrinho(carrinhoId, produtoId, quantidade) {
        const [existente] = await pool.query(
            'SELECT * FROM itens_carrinho WHERE id_carrinho = ? AND produto_id = ?',
            [carrinhoId, produtoId]
        );

        if (existente.length > 0) {
            await pool.query(
                'UPDATE itens_carrinho SET quantidade = quantidade + ? WHERE id_carrinho = ? AND produto_id = ?',
                [quantidade, carrinhoId, produtoId]
            );
        } else {
            await pool.query(
                'INSERT INTO itens_carrinho (id_carrinho, produto_id, quantidade) VALUES (?, ?, ?)',
                [carrinhoId, produtoId, quantidade]
            );
        }
    }

    static async listarItensDoCarrinho(carrinhoId) {
        const [linhas] = await pool.query(
            `SELECT 
                ic.id_item_carrinho,
                ic.quantidade,
                p.nome,
                p.preco
            FROM itens_carrinho ic
            JOIN produtos p ON p.produto_id = ic.produto_id
            WHERE ic.id_carrinho = ?`,
            [carrinhoId]
        );
        return linhas;
    }

    static async atualizarQuantidadeItem(itemId, carrinhoId, novaQuantidade) {
        if (novaQuantidade <= 0) {
            throw new Error("A quantidade deve ser maior que zero.");
        }
        await pool.query(
            'UPDATE itens_carrinho SET quantidade = ? WHERE id_item_carrinho = ? AND id_carrinho = ?',
            [novaQuantidade, itemId, carrinhoId]
        );
    }

    static async removerItemDoCarrinho(itemId, carrinhoId) {
        const query = `
        DELETE FROM itens_carrinho
        WHERE id_item_carrinho = ? AND id_carrinho = ?
    `;
        await pool.query(query, [itemId, carrinhoId]);
    }

    static async buscarCarrinhoMaisRecentePorCliente(id_cliente) {
        try {
            const [linhas] = await pool.query(`
                SELECT * FROM carrinhos
                WHERE id_cliente = ?
                ORDER BY id_carrinho DESC
                LIMIT 1
            `, [id_cliente]);

            return linhas[0] || null;
        } catch (erro) {
            console.error('Erro ao buscar carrinho mais recente:', erro);
            throw erro;
        }
    }
}

module.exports = CarrinhoModel;
