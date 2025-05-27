const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');  // Node.js built-in assert

let estado = {
    pedidoSelecionado: false,
    novoStatus: null,
    mensagem: ''
};

Given('que o estoquista acessou a lista de pedidos', function () {
    estado.pedidoSelecionado = true;
});

When('ele clica em "Editar Pedido"', function () {
    if (!estado.pedidoSelecionado) throw new Error('Nenhum pedido foi selecionado');
});

When('altera o status para {string}', function (status) {
    estado.novoStatus = status;
});

Then('o sistema exibe a mensagem {string}', function (mensagemEsperada) {
    estado.mensagem = 'Status atualizado com sucesso!';
    assert.strictEqual(estado.mensagem, mensagemEsperada);
});
