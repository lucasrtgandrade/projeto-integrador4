import 'cypress-file-upload';

describe('Cadastro de Produto - Administrador', () => {
    it('Deve cadastrar um novo produto e exibir na página de listagem de produtos', () => {
        // Realiza o login
        cy.visit('http://localhost:3030/backoffice/auth');  // URL de login da sua aplicação

        // Preenche os campos de login
        cy.get('#input-email-colaborador').type('teste_adm@example.com');  // Substitua com o email correto
        cy.get('#input-senha-colaborador').type('123');           // Substitua com a senha correta
        cy.get('input[type="submit"]').click();                         // Envia o formulário de login

        // Aguarda até que o login seja bem-sucedido e a página de cadastro de produto seja carregada
        cy.url().should('include', '/backoffice/administrador');  // Verifica se foi redirecionado para o painel do administrador

        // Após o login, visita a página de cadastro de produto
        cy.visit('http://localhost:3030/backoffice/administrador/cadastrar-produto');

        // Verifica se a página de cadastro está sendo exibida
        cy.contains('Cadastrar Produto').should('exist');

        // Preenche os campos do formulário
        cy.get('input[name="nome"]').type('Produto Teste');
        cy.get('textarea[name="descricao"]').type('Descrição do produto');
        cy.get('input[name="preco"]').type('100.5');
        cy.get('input[name="qtd_estoque"]').type('50');
        cy.get('select[name="avaliacao"]').select('5.0');  // Seleciona a avaliação 5.0

        // Anexa uma imagem
        const imagemPath = 'imagem1.png'; // O Cypress automaticamente procura em cypress/fixtures/
        cy.get('input[type="file"]').attachFile(imagemPath);    

        // Marca a imagem principal
        cy.get('input[name="imagem_principal"]').check();

        // Clica no botão para cadastrar o produto
        cy.get('button[type="submit"]').click();

        // Verifica se o redirecionamento ocorreu para a página de listagem de produtos
        cy.url().should('include', '/backoffice/administrador/listar-produtos');

    });
});
