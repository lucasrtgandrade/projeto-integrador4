# language: pt

Funcionalidade: Alteração de status de pedidos

  @alterarStatus
  Cenário: Estoquista altera o status de um pedido
    Dado que o estoquista acessou a lista de pedidos
    Quando ele clica em "Editar Pedido"
    E altera o status para "Entregue"
    Então o sistema exibe a mensagem "Status atualizado com sucesso!"