const ProdutoModel = require('../../models/backoffice/ProdutoModel');
const pool = require('../../config/db');

jest.mock('../../config/db'); // Mock da conexão com o banco de dados

describe('ProdutoModel.cadastrarProduto', () => {
    it('deve cadastrar um produto corretamente no banco de dados', async () => {
        const mockProduto = {
            nome: 'Produto Teste',
            descricao: 'Descrição do produto',
            preco: 100.5,
            qtd_estoque: 50
        };

        // Mock do retorno da query de inserção do produto
        pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

        const produtoId = await ProdutoModel.cadastrarProduto(
            mockProduto.nome, 
            mockProduto.descricao, 
            mockProduto.preco, 
            mockProduto.qtd_estoque
        );

        expect(produtoId).toBe(1); // Verifica se o ID do produto foi retornado corretamente
        expect(pool.query).toHaveBeenCalledWith(
            'INSERT INTO produtos (nome, descricao, preco, qtd_estoque, status) VALUES (?, ?, ?, ?, ?)', 
            [mockProduto.nome, mockProduto.descricao, mockProduto.preco, mockProduto.qtd_estoque, 1]
        ); // Verifica se a query de inserção foi chamada com os parâmetros corretos
    });

    it('deve lançar erro se as imagens não forem passadas como um array', async () => {
        const mockImagens = 'imagem1.jpg'; // Não é um array
        const produtoId = 1;

        await expect(ProdutoModel.cadastrarImagens(produtoId, mockImagens, 0))
            .rejects
            .toThrow('Imagens devem ser um array'); // Espera o erro ser lançado
    });

    it('deve inserir as imagens corretamente no banco de dados', async () => {
        const imagensMock = ['imagem1.jpg', 'imagem2.jpg'];
        const produtoId = 1;
        const imagemPrincipalIndex = 0;

        // Mock do retorno da query de inserção das imagens
        pool.query.mockResolvedValueOnce([{}]);

        await ProdutoModel.cadastrarImagens(produtoId, imagensMock, imagemPrincipalIndex);

        expect(pool.query).toHaveBeenCalledTimes(2); // Deve chamar a query para cada imagem
        expect(pool.query).toHaveBeenCalledWith(
            'INSERT INTO imagens (url, is_principal, produto_id) VALUES (?, ?, ?)',
            ['imagem1.jpg', true, produtoId] // Espera que a primeira imagem seja a principal
        );
    });
});
