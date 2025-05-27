describe('Listagem de Pedidos - Estoquista', () => {
    it('Deve exibir a lista de pedidos com botão editar', () => {
        cy.visit('http://localhost:3030/backoffice/estoquista/listar-pedidos');

        cy.contains('Lista de Pedidos').should('exist');
        cy.get('table').should('exist');
        cy.get('table tbody tr').should('have.length.at.least', 1);
        cy.get('table tbody tr').each(($row) => {
            cy.wrap($row).find('.btn-editar').should('exist');
        });
    });
});