describe('API Testing with Cypress', () => {
  it('successfully loads', () => {
    cy.visit('/icons');
    cy.title().should('include', 'All Icons');
  });
});
