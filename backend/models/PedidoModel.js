const pool = require('../config/db');

class PedidoModel {
    static async atualizarEnderecoEntrega(idPedido, idEndereco) {
        const sql = 'UPDATE pedidos SET id_endereco_entrega = ? WHERE id_pedido = ?';
        await pool.query(sql, [idEndereco, idPedido]);
    }

    static async buscarPedidosPorCliente(id_cliente) {
        const sql = `
        SELECT * FROM pedidos
        WHERE id_cliente = ?
        ORDER BY data_pedido DESC
    `;
        const [result] = await pool.query(sql, [id_cliente]);
        return result;
    }

    static async atribuirPedidoCliente(id_cliente, id_carrinho, id_frete, valor_total, custo) {
        const [existente] = await pool.query(
            'SELECT * FROM pedidos WHERE id_cliente = ? AND id_carrinho = ?',
            [id_cliente, id_carrinho]
        );

        if (existente.length > 0) {
            await pool.query(
                'UPDATE pedidos SET id_frete = ?, valor_total = ?, valor_frete = ? WHERE id_cliente = ? AND id_carrinho = ?',
                [id_frete, valor_total, custo, id_cliente, id_carrinho]
            );
        } else {
            await pool.query(
                'INSERT INTO pedidos (id_cliente, id_carrinho, id_frete, valor_total, valor_frete) VALUES (?, ?, ?, ?, ?)',
                [id_cliente, id_carrinho, id_frete, valor_total, custo]
            );
        }
    }

    static async criarPedido({
                                 id_cliente,
                                 id_endereco_entrega,
                                 id_frete,
                                 valor_total,
                                 valor_frete,
                                 numero_pedido
                             }) {
        const [resultado] = await pool.query(`
            INSERT INTO pedidos (
                id_cliente,
                id_endereco_entrega,
                id_frete,
                valor_total,
                valor_frete,
                numero_pedido
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [id_cliente, id_endereco_entrega, id_frete, valor_total, valor_frete, numero_pedido]);

        return resultado;
    }

    static async buscarPedidoMaisRecentePorCliente(id_cliente) {
        const [rows] = await pool.query(`
            SELECT * FROM pedidos
            WHERE id_cliente = ?
            ORDER BY id_pedido DESC
            LIMIT 1
        `, [id_cliente]);

        return rows[0] || null;
    }

    static async buscarCarrinhoMaisRecentePorCliente(id_cliente) {
        const [rows] = await pool.query(`
            SELECT * FROM carrinhos
            WHERE id_cliente = ?
            ORDER BY id_carrinho DESC
            LIMIT 1
        `, [id_cliente]);

        return rows[0] || null;
    }

    static async encontrarPedidoCliente(id_pedido, id_cliente) {
        const [linhas] = await pool.query(`
            SELECT * FROM pedidos WHERE id_pedido = ? AND id_cliente = ?`, [id_pedido, id_cliente]);
        return linhas[0] || null;
    }

    static async atribuirEndEntregaPedido( id_endereco_entrega, id_pedido, id_cliente) {
        const [resultado] = await pool.query(`
            UPDATE pedidos SET id_endereco_entrega = ? WHERE id_pedido = ? AND id_cliente = ?`,
            [id_endereco_entrega, id_pedido, id_cliente]);
        return resultado.affectedRows > 0;
    }

}

module.exports = PedidoModel;