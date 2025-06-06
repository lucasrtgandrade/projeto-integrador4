const request = require('supertest');
const app = require('./app.test');
const ProdutoModel = require('../../models/backoffice/ProdutoModel');
const path = require('path');

jest.mock('../../models/backoffice/ProdutoModel');

const imagemPath = path.resolve(__dirname, '../mocks/imagem1.png');

describe('POST /backoffice/administrador/cadastrar-produto', () => {
    it('deve renderizar a página de cadastro de produto com status 200', async () => {
        const response = await request(app).get('/backoffice/administrador/cadastrar-produto');

        expect(response.status).toBe(200);
        expect(response.text).toContain('Cadastrar Produto');
    });

    it('deve cadastrar um produto com sucesso e redirecionar para listar produtos', async () => {
        const produtoFake = {
            nome: 'Produto Teste',
            descricao: 'Descrição do produto',
            preco: 100.5,
            qtd_estoque: 50,
            avaliacao: 5,
        };

        ProdutoModel.cadastrarProduto.mockResolvedValueOnce(1); // Mock do ID do produto inserido
        ProdutoModel.cadastrarAvaliacao.mockResolvedValueOnce({});
        ProdutoModel.cadastrarImagens.mockResolvedValueOnce({});

        const response = await request(app)
            .post('/backoffice/administrador/cadastrar-produto')
            .field('nome', produtoFake.nome)
            .field('descricao', produtoFake.descricao)
            .field('preco', produtoFake.preco)
            .field('qtd_estoque', produtoFake.qtd_estoque)
            .field('avaliacao', produtoFake.avaliacao)
            .attach('imagens', imagemPath) // Aqui usamos o caminho real do arquivo
            .field('imagem_principal', 0); // Indicando que a imagem anexada é a principal (índice 0)

        expect(response.status).toBe(302); // Status de redirecionamento após sucesso
        expect(response.header.location).toBe('/backoffice/administrador/listar-produtos'); // Verifica redirecionamento
    });

    it('deve retornar erro 400 se algum campo obrigatório estiver faltando', async () => {
        const response = await request(app)
            .post('/backoffice/administrador/cadastrar-produto')
            .field('nome', 'Produto Teste')
            .field('descricao', '') // Campo obrigatório ausente
            .field('preco', 100.5)
            .field('qtd_estoque', 50)
            .field('avaliacao', 5)
            .attach('imagens', imagemPath)
            .field('imagem_principal', 0);

        expect(response.status).toBe(400); // Espera erro
        expect(response.text).toContain('Todos os campos são obrigatórios');
    });
});
