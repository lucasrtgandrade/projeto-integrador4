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
            const resultado = await PedidoModel.criarPedido({
                id_cliente: cliente,
                id_carrinho: id_carrinho,
                id_frete: frete_id,
                valor_total,
                valor_frete
            });

            const pedidoId = resultado.insertId;

            // Armazena o pedido na sessão
            req.session.pedidoId = pedidoId;
            req.session.valorTotalPedido = valor_total;

            console.log("Pedido ID salvo na sessão:", pedidoId);

            return res.status(200).json({
                mensagem: 'Pedido finalizado com sucesso!',
                pedidoId,
                valorTotal: valor_total,
            });
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

            if (!req.session.checkout) req.session.checkout = {};
            req.session.checkout.cliente = { id: id_cliente };
            req.session.checkout.pedido = { id: id_pedido };
            req.session.checkout.enderecoEntrega = { id: id_endereco_entrega };

            return res.status(200).json({ sucesso: true, mensagem: 'Endereço atualizado no pedido com sucesso.' });
        } catch (erro) {
            console.error('Erro ao salvar endereço:', erro);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao salvar endereço.' });
        }
    }

    static async renderizarPaginaPagamentos(req, res) {
        try {
            const clienteId = req.session?.user?.id;
            const pedidoId = req.session.pedidoId;
            const carrinhoId = req.session.idCarrinho;
            const valorTotal = req.session.valorTotalPedido;

            console.log(clienteId, pedidoId, "carrinho Id:", carrinhoId);

            const pedido = await PedidoModel.encontrarPedidoCliente(pedidoId, clienteId );

            if (!pedido) {
                return res.status(404).send('Pedido não encontrado.');
            }

            console.log("Cliente:", clienteId);
            console.log("Pedido:", pedidoId);
            console.log("Carrinho:", carrinhoId);

            res.render('checkout-pagamentos', {
                clienteId,
                pedidoId,
                carrinhoId,
                pedido,
                valorTotal
            });
        } catch (error) {
            console.error('Erro ao carregar página de pagamento:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno ao carregar a página de pagamento.'
            });
        }
    }

    static async salvarFormaPagamento(req, res) {
        const { metodo, cartao } = req.body;
        const cliente = req.session.user?.id;
        const pedidoId = req.session.pedidoId;
        const valorTotal = req.session.valorTotalPedido;

        req.session.pagamento = {
            metodo: metodo
        };

        // Se for cartão de crédito, salvar as informações necessárias
        if (metodo === 'CARTAO_CREDITO' && cartao) {
            req.session.pagamento.cartao = {
                parcelas: cartao.parcelas
            };
        }

        // Verifique se todos os dados obrigatórios estão presentes
        if (metodo === 'CARTAO_CREDITO' && (!cartao.numero || !cartao.nome || !cartao.cvv || !cartao.validade || !cartao.parcelas)) {
            return res.status(400).json({ mensagem: 'Todos os campos do cartão de crédito são obrigatórios.' });
        }

        if (!metodo) {
            return res.status(400).json({ mensagem: 'Método de pagamento não selecionado.' });
        }

        try {
            // 1. Inserir o pagamento na tabela de pedidos (sem dados do cartão)
            const inserirPagamento = await PedidoModel.inserirFormaPagamento(
                pedidoId,
                metodo,
                valorTotal,
                cartao?.parcelas || 1 // Se for cartão, salvar as parcelas; senão, valor padrão
            );

            if (!inserirPagamento) {
                return res.status(404).json({ sucesso: false, mensagem: 'Pagamento não foi inserido' });
            }

            console.log("Pagamento inserido com sucesso");
            res.status(200).json({ sucesso: true, mensagem: 'Pagamento realizado com sucesso!' });
        } catch (erro) {
            console.error('Erro ao inserir pagamento: ', erro);
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao processar o pagamento.' });
        }
    }

    static async renderizarPaginaResumoPedido(req, res) {
        res.render('checkout-resumo')
    }

}

module.exports = PedidoController;