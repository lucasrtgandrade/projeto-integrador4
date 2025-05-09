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
                'INSERT INTO pedidos (id_cliente, id_carrinho ,id_frete, valor_total, valor_frete) VALUES (?, ?, ?, ?, ?)',
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

    static async buscarItensPorPedido(id_pedido) {
        const [itens] = await pool.query(`
            SELECT ip.*, p.nome, p.descricao
            FROM itens_pedido ip
                     JOIN produtos p ON ip.id_produto = p.produto_id
            WHERE ip.id_pedido = ?
        `, [id_pedido]);

        return itens;
    }

    static async adicionarItemAoPedido(id_pedido, id_produto, quantidade, preco_unitario) {
        const sql = `
            INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
            VALUES (?, ?, ?, ?)
        `;
        await pool.query(sql, [id_pedido, id_produto, quantidade, preco_unitario]);
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

    static async atribuirEndEntregaPedido(id_endereco_entrega, id_pedido, id_cliente) {
        const [resultado] = await pool.query(`
                    UPDATE pedidos SET id_endereco_entrega = ? WHERE id_pedido = ? AND id_cliente = ?`,
            [id_endereco_entrega, id_pedido, id_cliente]);
        return resultado.affectedRows > 0;
    }

    static async inserirFormaPagamento(pedidoId, metodo, valorTotal, parcelas) {
        const query = `
            INSERT INTO pagamentos (id_pedido, metodo, valor, parcelas)
            VALUES (?, ?, ?, ?)
        `;
        try {
            const [result] = await pool.query(query, [pedidoId, metodo, valorTotal, parcelas]);
            return result.affectedRows > 0;
        } catch (erro) {
            console.error('Erro ao inserir pagamento:', erro);
            throw erro;
        }
    }

    static async buscarResumoPedido(idPedido, idCliente) {
        const [pedidoRows] = await pool.query(`
            SELECT p.*, e.*, f.custo AS valor_frete, f.nome AS nome_frete, f.prazo_entrega
            FROM pedidos p
                     JOIN enderecos e ON p.id_endereco_entrega = e.id_endereco
                     JOIN fretes f ON p.id_frete = f.frete_id
            WHERE p.id_pedido = ? AND p.id_cliente = ?
        `, [idPedido, idCliente]);

        const pedido = pedidoRows[0];

        if (!pedido) {
            return null;  // Pedido não encontrado ou não é do cliente
        }

        const [itens] = await pool.query(`
            SELECT i.*, pr.nome, pr.descricao, pr.preco, img.url AS imagem
            FROM itens_pedido i
            JOIN produtos pr ON i.id_produto = pr.produto_id
            LEFT JOIN imagens img ON img.produto_id = pr.produto_id AND img.is_principal = TRUE
            WHERE i.id_pedido = ?
        `, [idPedido]);

        const [pagamentoRows] = await pool.query(`
            SELECT * FROM pagamentos WHERE id_pedido = ?
        `, [idPedido]);

        const pagamento = pagamentoRows[0] || null;

        return {
            pedido,
            itens,
            pagamento
        };
    }

    static async definirNumeroPedido (id_pedido, numero_pedido) {
    await pool.query(`
        UPDATE pedidos 
        SET numero_pedido = ?, status = 'PENDENTE', data_pedido = NOW()
        WHERE id_pedido = ?
    `, [numero_pedido, id_pedido]);
    };

    static async listarPedidosAguardandoPagamento() {
        const [rows] = await pool.query(
            `SELECT p.numero_pedido, p.data_pedido, p.valor_total, c.status AS cliente
         FROM pedidos p
         JOIN clientes c ON p.id_cliente = c.id_cliente
         WHERE p.status = 'AGUARDANDO_PAGAMENTO'
         ORDER BY p.data_pedido DESC`
        );
        return rows;
    }
}

module.exports = PedidoModel;
