// Variables to store the selected employee's data
let selectedIdFuncionario = null;
let selectedNewStatus = null;

// Get the modal and buttons
const modal = document.getElementById('confirmationModal');
const modalMessage = document.getElementById('modalMessage');
const confirmButton = document.getElementById('confirmButton');
const cancelButton = document.getElementById('cancelButton');

// Function to show the modal
function showModal(message) {
    modalMessage.textContent = message;
    modal.style.display = 'flex';
}

// Function to hide the modal
function hideModal() {
    modal.style.display = 'none';
}

// Add event listeners to all status toggle elements
document.querySelectorAll('.status-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
        const id_funcionario = this.getAttribute('data-id');
        const currentStatus = this.getAttribute('data-status') === '1'; // Use '1' for true, '0' for false
        const newStatus = currentStatus ? 0 : 1; // Toggle between 1 (active) and 0 (inactive)

        // Store the selected employee's data
        selectedIdFuncionario = id_funcionario;
        selectedNewStatus = newStatus;

        // Show the confirmation modal
        const action = newStatus ? 'ativar' : 'desativar';
        showModal(`Tem certeza que deseja ${action} este usuário?`);
    });
});

// Handle confirm button click
confirmButton.addEventListener('click', async function() {
    try {
        const response = await fetch('/backoffice/atualizar-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_funcionario: selectedIdFuncionario, situacao: selectedNewStatus }),
        });

        const data = await response.json();

        if (response.ok) {
            // Reload the page to reflect the updated status
            window.location.reload();
        } else {
            alert('Erro ao atualizar o status do usuário');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar o status do usuário');
    } finally {
        hideModal();
    }
});

// Handle cancel button click
cancelButton.addEventListener('click', function() {
    hideModal();
});

// Add event listeners to all edit buttons
document.querySelectorAll('.edit-button').forEach(button => {
    button.addEventListener('click', function() {
        const id_funcionario = this.getAttribute('data-id');
        // Redirect to the edit page for the selected employee
        window.location.href = `/backoffice/editar-usuario/${id_funcionario}`;
    });
});