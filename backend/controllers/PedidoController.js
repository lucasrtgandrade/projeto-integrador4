const PedidoModel = require('../models/PedidoModel');
const CarrinhoModel = require('../models/CarrinhoModel');

class PedidoController {
    // Listar pedidos do cliente
    static async listarPedidosCliente(req, res) {
        const id_cliente = req.session?.user?.id;

        if (!id_cliente) {
            return res.status(401).redirect('/login');
        }

        try {
            const pedidos = await PedidoModel.buscarPedidosPorCliente(id_cliente);
            return res.render('listar-pedidos', { pedidos });
        } catch (erro) {
            console.error('Erro ao listar pedidos:', erro);
            return res.status(500).json({ erro: 'Erro interno ao listar pedidos' });
        }
    }

    // Criar novo pedido
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

    // Finalizar pedido
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

            req.session.pedidoId = pedidoId;
            req.session.valorTotalPedido = valor_total;

            const itensCarrinho = await CarrinhoModel.buscarItensCarrinho(id_carrinho);

            for (let item of itensCarrinho) {
                await PedidoModel.adicionarItemAoPedido(pedidoId, item.id_produto, item.quantidade, item.preco_unitario);
            }

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

    // Salvar endereço de entrega
    static async salvarEnderecoEntrega(req, res) {
        try {
            const id_cliente = req.session?.user?.id;

            if (!id_cliente) {
                return res.status(401).json({ sucesso: false, mensagem: 'Não autenticado.' });
            }

            const { id_pedido, id_endereco_entrega } = req.body;

            const encontrarPedido = await PedidoModel.encontrarPedidoCliente(id_pedido, id_cliente);

            if (!encontrarPedido) {
                return res.status(404).json({ sucesso: false, mensagem: "Pedido não encontrado." });
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

    // Renderizar página de pagamentos
    static async renderizarPaginaPagamentos(req, res) {
        try {
            const clienteId = req.session?.user?.id;
            const pedidoId = req.session.pedidoId;
            const carrinhoId = req.session.idCarrinho;
            const valorTotal = req.session.valorTotalPedido;

            const pedido = await PedidoModel.encontrarPedidoCliente(pedidoId, clienteId);

            if (!pedido) {
                return res.status(404).send('Pedido não encontrado.');
            }

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

    // Salvar forma de pagamento
    static async salvarFormaPagamento(req, res) {
        const { metodo, cartao } = req.body;
        const cliente = req.session.user?.id;
        const pedidoId = req.session.pedidoId;
        const valorTotal = req.session.valorTotalPedido;

        req.session.pagamento = { metodo };

        if (metodo === 'CARTAO_CREDITO' && cartao) {
            req.session.pagamento.cartao = {
                parcelas: cartao.parcelas
            };
        }

        if (metodo === 'CARTAO_CREDITO' && (!cartao.numero || !cartao.nome || !cartao.cvv || !cartao.validade || !cartao.parcelas)) {
            return res.status(400).json({ mensagem: 'Todos os campos do cartão de crédito são obrigatórios.' });
        }

        if (!metodo) {
            return res.status(400).json({ mensagem: 'Método de pagamento não selecionado.' });
        }

        try {
            const inserirPagamento = await PedidoModel.inserirFormaPagamento(
                pedidoId,
                metodo,
                valorTotal,
                cartao?.parcelas || 1
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

    // Renderizar página de resumo do pedido
    static async renderizarPaginaResumoPedido(req, res) {
        const idCliente = req.session.user?.id;
        const idPedido = req.session.pedidoId;

        if (!idPedido) {
            return res.status(400).send('Pedido não encontrado na sessão.');
        }

        try {
            const resumo = await PedidoModel.buscarResumoPedido(idPedido, idCliente);

            if (!resumo) {
                return res.status(404).send('Resumo do pedido não encontrado.');
            }

            res.render('checkout-resumo', {
                pedido: resumo.pedido,
                itens: resumo.itens,
                pagamento: resumo.pagamento,
                resumo
            });
        } catch (erro) {
            console.error(erro);
            res.status(500).send('Erro ao buscar dados do pedido.');
        }
    }

    static async concluirCompra(req, res) {
        const id_pedido = req.params.id_pedido;


        function gerarNumeroPedido() {
            const data = new Date().toISOString().slice(0,10).replace(/-/g, '');
            const codigoAleatorio = Math.random().toString(36).substring(2, 7).toUpperCase();
            return `PED-${data}-${codigoAleatorio}`;
        }


        try {
            const numero_pedido = gerarNumeroPedido();

            await PedidoModel.definirNumeroPedido(id_pedido, numero_pedido);
            const valorTotal = req.session.valorTotalPedido;
            res.render('compra-concluida', { numero_pedido, valorTotal });
        } catch (erro) {
            console.error('Erro ao concluir compra:', erro);
            res.status(500).send('Erro ao concluir compra.');
        }
    }

    static async listarPedidos(req, res) {
        try {
            const pedidos = await PedidoModel.listarPedidosAguardandoPagamento();
            res.render('listar-pedidos', { pedidos });
        } catch (error) {
            console.error('Erro ao listar pedidos:', error);
            res.status(500).send('Erro interno');
        }
    }
}

module.exports = PedidoController;
