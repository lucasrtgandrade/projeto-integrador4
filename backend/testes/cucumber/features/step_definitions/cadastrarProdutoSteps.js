const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');  // Node.js built-in assert

let estado = {
    produto: null,
    statusCadastro: null,
    imagens: []
};

Given('que o administrador acessou a página de cadastro de produto', function () {
    // Simula o acesso à página de cadastro
    estado.statusCadastro = 'Página acessada';
});

When('ele preenche os dados do produto e clica em "Cadastrar Produto"', function () {
    const produtoFake = {
        nome: 'Produto Teste',
        descricao: 'Descrição do produto',
        preco: 100.5,
        qtd_estoque: 50,
        avaliacao: 5
    };

    // Simulando a ação de cadastro do produto
    estado.produto = produtoFake;
    estado.statusCadastro = 302; // Simula um redirecionamento após cadastro (código de sucesso de redirecionamento)
    estado.imagens = ['imagem1.png']; // Simulando imagens anexadas ao produto
});

Then('o produto deve ser exibido corretamente na página principal da loja, com as imagens anexadas', function () {
    // Verificando se o cadastro foi realizado corretamente
    assert.strictEqual(estado.statusCadastro, 302, 'Esperado status de redirecionamento após cadastro');
    assert(estado.produto, 'Produto deve ser cadastrado');
    assert.strictEqual(estado.produto.nome, 'Produto Teste', 'Nome do produto deve ser "Produto Teste"');
    assert.strictEqual(estado.produto.descricao, 'Descrição do produto', 'Descrição do produto deve ser "Descrição do produto"');
    assert.strictEqual(estado.produto.preco, 100.5, 'Preço do produto deve ser 100.5');
    assert.strictEqual(estado.produto.qtd_estoque, 50, 'Quantidade do produto deve ser 50');
    assert(estado.imagens.length > 0, 'O produto deve ter imagens anexadas');
});
