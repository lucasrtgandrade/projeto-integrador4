const request = require('supertest');
const app = require('./app.test');
const PedidoModel = require('../../models/PedidoModel');

jest.mock('../../models/PedidoModel');

describe('GET /estoquista/listar-pedidos', () => {
    it('deve renderizar a lista de pedidos com status 200', async () => {
        const pedidosFake = [
            {
                id_pedido: 1,
                numero_pedido: '0001',
                data_pedido: new Date('2025-05-25'),
                valor_total: 150.75,
                status: 'Entregue'
            },
            {
                id_pedido: 2,
                numero_pedido: '0002',
                data_pedido: new Date('2025-05-24'),
                valor_total: 99.99,
                status: 'Em transito'
            }
        ];

        PedidoModel.listarPedidosGerais.mockResolvedValueOnce(pedidosFake);

        const response = await request(app).get('/backoffice/estoquista/listar-pedidos');

        expect(response.status).toBe(200);
        expect(response.text).toContain('Lista de Pedidos');
        expect(response.text).toContain('0001');
        expect(response.text).toContain('Entregue');
        expect(response.text).toContain('R$ 150,75');
    });
});
