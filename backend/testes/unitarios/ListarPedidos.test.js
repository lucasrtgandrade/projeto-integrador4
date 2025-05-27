const PedidoModel = require('../../models/PedidoModel');
const pool = require('../../config/db');

jest.mock('../../config/db');

describe('PedidoModel.listarPedidosGerais', () => {
    it('deve retornar um array com os campos esperados', async () => {
        const mockPedidos = [
            {
                id_pedido: 1,
                numero_pedido: '0001',
                data_pedido: new Date('2025-05-25'),
                valor_total: 120.5,
                status: 'Entregue'
            },
            {
                id_pedido: 2,
                numero_pedido: '0002',
                data_pedido: new Date('2025-05-24'),
                valor_total: 200.0,
                status: 'Em transito'
            }
        ];

        // Simula o retorno do banco
        pool.query.mockResolvedValueOnce([mockPedidos]);

        const pedidos = await PedidoModel.listarPedidosGerais();

        expect(Array.isArray(pedidos)).toBe(true);
        expect(pedidos.length).toBe(2);
        expect(pedidos[0]).toHaveProperty('id_pedido');
        expect(pedidos[0]).toHaveProperty('numero_pedido');
        expect(pedidos[0]).toHaveProperty('data_pedido');
        expect(pedidos[0]).toHaveProperty('valor_total');
        expect(pedidos[0]).toHaveProperty('status');
    });

    it('deve retornar os pedidos em ordem decrescente de data', async () => {
        const mockPedidos = [
            { id_pedido: 1, data_pedido: new Date('2025-05-25') },
            { id_pedido: 2, data_pedido: new Date('2025-05-24') }
        ];

        pool.query.mockResolvedValueOnce([mockPedidos]);

        const pedidos = await PedidoModel.listarPedidosGerais();

        const datas = pedidos.map(p => new Date(p.data_pedido));
        const ordenadas = [...datas].sort((a, b) => b - a);

        expect(datas).toEqual(ordenadas);
    });
});
