document.addEventListener('DOMContentLoaded', function () {
    // Variável global para armazenar o ID do colaborador atual no modal
    let currentColaboradorId;

    // Modal de Confirmação
    const modal = document.getElementById('confirmationModal');
    const modalMessage = document.getElementById('modalMessage');
    const confirmButton = document.getElementById('confirmButton');
    const cancelButton = document.getElementById('cancelButton');

    // Mostrar modal de confirmação para ativar/desativar colaborador
    window.mostrarModal = function (colaboradorId, action) {
        currentColaboradorId = colaboradorId; // Armazena o ID

        // Define a mensagem do modal com base na ação (Ativar/Desativar)
        modalMessage.innerText =
            action === 'desativar'
                ? 'O colaborador será desativado. Você tem certeza?'
                : 'O colaborador será ativado. Você tem certeza?';

        // Exibe o modal
        modal.style.display = 'block';
    };

    // Função para alternar o status do colaborador
    confirmButton.addEventListener('click', async function () {
        try {
            const response = await fetch(`/backoffice/administrador/alterar-status-colaborador/${currentColaboradorId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                // Atualiza o status e o botão na tabela dinamicamente
                const statusCell = document.getElementById(`status-${currentColaboradorId}`);
                const button = document.querySelector(`#colaborador-${currentColaboradorId} button`);

                if (data.novoStatus === 1) {
                    statusCell.innerText = 'Ativo';
                    button.innerText = 'Desativar';
                    button.classList.remove('ativar');
                    button.classList.add('desativar');
                } else {
                    statusCell.innerText = 'Inativo';
                    button.innerText = 'Ativar';
                    button.classList.remove('desativar');
                    button.classList.add('ativar');
                }

                alert(data.mensagem);
            } else {
                alert('Erro ao alternar status do colaborador');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao alternar status do colaborador');
        }

        // Esconde o modal
        modal.style.display = 'none';
    });

    // Fecha o modal ao clicar no botão "Não"
    cancelButton.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Fecha o modal ao clicar fora dele
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Filtrar colaboradores pelo nome digitado no input
    document.getElementById('filterInput').addEventListener('input', function () {
        const filterValue = this.value.toLowerCase();
        const rows = document.querySelectorAll('#colaboradoresTableBody tr');

        rows.forEach(row => {
            const nome = row.querySelector('td').textContent.toLowerCase();
            row.style.display = nome.includes(filterValue) ? '' : 'none';
        });
    });
});
