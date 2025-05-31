const request = require('supertest');
const app = require('./app.test');
const ProdutoModel = require('../../models/backoffice/ProdutoModel');

jest.mock('../../models/backoffice/ProdutoModel');

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
            imagem_principal: 'imagem1.jpg',
            imagens: [
                { originalname: 'imagem1.jpg', path: 'caminho/imagem1.jpg' }
            ]
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
            .attach('imagens', produtoFake.imagens[0].path) // Anexando arquivo
            .field('imagem_principal', 0); // Indicando qual é a imagem principal

        expect(response.status).toBe(302); // Status de redirecionamento após sucesso
        expect(response.header.location).toBe('/backoffice/administrador/listar-produtos'); // Verificando redirecionamento
    });

    it('deve retornar erro 400 se algum campo obrigatório estiver faltando', async () => {
        const produtoFakeIncompleto = {
            nome: 'Produto Teste',
            descricao: '',
            preco: 100.5,
            qtd_estoque: 50,
            avaliacao: 5,
            imagem_principal: 'imagem1.jpg',
            imagens: [
                { originalname: 'imagem1.jpg', path: 'caminho/imagem1.jpg' }
            ]
        };

        const response = await request(app)
            .post('/backoffice/administrador/cadastrar-produto')
            .field('nome', produtoFakeIncompleto.nome)
            .field('descricao', produtoFakeIncompleto.descricao)
            .field('preco', produtoFakeIncompleto.preco)
            .field('qtd_estoque', produtoFakeIncompleto.qtd_estoque)
            .field('avaliacao', produtoFakeIncompleto.avaliacao)
            .attach('imagens', produtoFakeIncompleto.imagens[0].path)
            .field('imagem_principal', 0);

        expect(response.status).toBe(400); // Espera erro de requisição malformada
        expect(response.text).toContain('Todos os campos são obrigatórios');
    });
});
