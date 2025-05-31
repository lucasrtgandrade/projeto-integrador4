const ProdutoModel = require('../../models/backoffice/ProdutoModel');
const pool = require('../../config/db');

jest.mock('../../config/db'); // Mock da conexão com o banco de dados

describe('ProdutoModel', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Limpa os mocks entre os testes
    });

    describe('cadastrarProduto', () => {
        it('deve cadastrar um produto corretamente no banco de dados', async () => {
            const mockProduto = {
                nome: 'Produto Teste',
                descricao: 'Descrição do produto',
                preco: 100.5,
                qtd_estoque: 50
            };

            pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

            const produtoId = await ProdutoModel.cadastrarProduto(
                mockProduto.nome,
                mockProduto.descricao,
                mockProduto.preco,
                mockProduto.qtd_estoque
            );

            expect(produtoId).toBe(1);
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO produtos (nome, descricao, preco, qtd_estoque, status) VALUES (?, ?, ?, ?, ?)',
                [mockProduto.nome, mockProduto.descricao, mockProduto.preco, mockProduto.qtd_estoque, 1]
            );
        });
    });

    describe('cadastrarImagens', () => {
        it('deve lançar erro se as imagens não forem passadas como um array', async () => {
            const mockImagens = 'imagem1.jpg'; // Tipo incorreto
            const produtoId = 1;

            await expect(
                ProdutoModel.cadastrarImagens(produtoId, mockImagens, 0)
            ).rejects.toThrow('Imagens devem ser um array');
        });

        it('deve inserir as imagens corretamente no banco de dados', async () => {
            const imagensMock = ['imagem1.jpg', 'imagem2.jpg'];
            const produtoId = 1;
            const imagemPrincipalIndex = 0;

            // Simula que cada chamada resolve
            pool.query
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([{}]);

            await ProdutoModel.cadastrarImagens(produtoId, imagensMock, imagemPrincipalIndex);

            expect(pool.query).toHaveBeenCalledTimes(2);
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO imagens (url, is_principal, produto_id) VALUES (?, ?, ?)',
                ['imagem1.jpg', true, produtoId]
            );
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO imagens (url, is_principal, produto_id) VALUES (?, ?, ?)',
                ['imagem2.jpg', false, produtoId]
            );
        });

        it('deve lidar com array vazio sem chamar a query', async () => {
            const produtoId = 1;
            const imagensVazias = [];

            await ProdutoModel.cadastrarImagens(produtoId, imagensVazias, 0);

            expect(pool.query).not.toHaveBeenCalled(); // Não deve executar query
        });
    });
});
