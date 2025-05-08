const PedidoModel = require('../models/PedidoModel');
const CarrinhoModel = require('../models/CarrinhoModel');

class PedidoController  {
    static async listarPedidosCliente(req, res) {
        const id_cliente = req.session?.user?.id;

        if (!id_cliente) {
            return res.status(401).redirect('/login');
        }

        try {
            const pedidos = await PedidoModel.buscarPedidosPorCliente(id_cliente);
            return res.render('listar-pedidos', { pedido: pedidos });
        } catch (erro) {
            console.error('Erro ao listar pedidos:', erro);
            return res.status(500).json({ erro: 'Erro interno ao listar pedidos' });
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
            const carrinho = await CarrinhoModel.buscarCarrinhoMaisRecentePorCliente(carrinho_id);
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

    static async salvarEnderecoEntrega(req, res) {
        try {
            const id_cliente = req.session?.user?.id;

            if (!id_cliente) {
                return res.status(401).json({ sucesso: false, mensagem: 'Não autenticado.' });
            }

            const { id_pedido, id_endereco_entrega } = req.body;

            const encontrarPedido = await PedidoModel.encontrarPedidoCliente(id_pedido, id_cliente);

            if (!encontrarPedido) {
                return res.status(404).json({ sucesso: false, mensagem: "Pedido não encontrado." })
            }

            const atualizado = await PedidoModel.atribuirEndEntregaPedido(id_endereco_entrega, id_pedido, id_cliente);

            if (!atualizado) {
                return res.status(500).json({ sucesso: false, mensagem: 'Não foi possível atualizar o endereço do pedido.' });
            }

            return res.status(200).json({ sucesso: true, mensagem: 'Endereço atualizado no pedido com sucesso.' });
        } catch (erro) {
            console.error('Erro ao salvar endereço:', erro);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao salvar endereço.' });
        }
    }

    // if (!id_cliente) {
    //     return res.status(401).json({ sucesso: false, mensagem: 'Não autenticado.' });
    // }

    static async renderizarPaginaPagamentos(req, res){
        try {
            const id_cliente = req.session?.user?.id;
            const { id_pedido, id_carrinho } = req.params;

            console.log("Id Cliente:", id_cliente, "Id Carrinho:", id_carrinho, "Id Pedido: ", id_pedido);

        res.render('checkout-pagamentos', {
            id_pedido,
            id_carrinho,
            id_cliente
        });
    } catch (error) {
            console.error('Erro ao salvar endereço:', error);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro interno pegar a pagina de pagamento.' });
        }
    }

}

module.exports = PedidoController;