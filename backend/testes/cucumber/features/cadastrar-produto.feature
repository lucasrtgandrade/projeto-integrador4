# language: pt

Funcionalidade: Cadastrar um Produto

  @cadastrarProduto
  Cenário: Administrador cadastra um produto
    Dado que o administrador acessou a página de cadastro de produto
    Quando ele preenche os dados do produto e clica em "Cadastrar Produto"
    Então o produto deve ser exibido corretamente na página principal da loja, com as imagens anexadas
