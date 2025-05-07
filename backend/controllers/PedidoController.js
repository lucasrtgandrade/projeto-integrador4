const PedidoModel = require('../models/PedidoModel');
const CarrinhoModel = require('../models/CarrinhoModel');

class PedidoController  {
    static async visualizarPedidos(req, res) {
        try {
            const id_cliente = req.session?.user?.id;
            if (!id_cliente) {
                return res.redirect('/clientes/login');
            }

            const pedido = await PedidoModel.buscarPedidosCliente(id_cliente);
            res.render('listar-pedidos', { pedido });
        } catch (erro) {
            console.log('Erro ao renderizar página de pedidos', erro);
            return res.status(500).send(erro);
        }
    }

    static async criarPedido(req, res) {
        const id_cliente_sessao = req.session?.user?.id;

        const { carrinho_id, cliente_id } = req.params;
        const { id_frete, valor_total, custo } = req.body;

        if (parseInt(cliente_id) !== id_cliente_sessao) {
            return res.status(403).json({ sucesso: false, mensagem: 'Ação não autorizada.' });
        }

        try {
            const carrinho = await CarrinhoModel.buscarPorId(carrinho_id);
            if (!carrinho) {
                return res.status(404).json({ sucesso: false, mensagem: 'Carrinho não encontrado.' });
            }

            await PedidoModel.atribuirPedidoCliente(cliente_id, carrinho_id, id_frete, valor_total, custo);

            return res.redirect('/clientes/listar-pedidos');
        } catch (error) {
            console.error('Erro ao criar o pedido:', error);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar o pedido.' });
        }
    }

    static async finalizarPedido(req, res) {
        const cliente = req.session.user?.id;
        const id_carrinho = req.session.idCarrinho;
        const { frete_id, valor_total, valor_frete } = req.body;

        if (!cliente) {
            return res.status(401).json({ mensagem: 'Usuário não autenticado.' });
        }

        if (!frete_id || !valor_total || !valor_frete) {
            return res.status(400).json({ mensagem: 'Dados incompletos para finalizar o pedido.' });
        }

        try {
            const novoPedido = await PedidoModel.criarPedido({
                id_cliente: cliente,
                id_carrinho: id_carrinho,
                id_frete: frete_id,
                valor_total,
                valor_frete
            });

            return res.status(200).json({ mensagem: 'Pedido finalizado com sucesso!' });
        } catch (erro) {
            console.error('Erro ao finalizar pedido:', erro);
            return res.status(500).json({ mensagem: 'Erro ao finalizar pedido.' });
        }
    }

}

module.exports = PedidoController;