const pool = require('../config/db');

class PedidoModel {
    static async atualizarEnderecoEntrega(idPedido, idEndereco) {
        const sql = 'UPDATE pedidos SET id_endereco_entrega = ? WHERE id_pedido = ?';
        await pool.query(sql, [idEndereco, idPedido]);
    }

    static async buscarPedidosCliente(id_cliente) {
        const sql = `SELECT * FROM pedidos WHERE id_cliente = ?`;
        const [pedidos] = await pool.query(sql, [id_cliente]);
        return pedidos;
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

}

module.exports = PedidoModel;