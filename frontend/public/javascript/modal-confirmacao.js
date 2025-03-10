import { toggleProductStatus } from '../utils/api.js';

let currentProductId = null;
let currentStatus = null;

export function setupModal() {
    const confirmButton = document.getElementById('confirmButton');
    const cancelButton = document.getElementById('cancelButton');

    confirmButton.addEventListener('click', handleConfirmButtonClick);
    cancelButton.addEventListener('click', handleCancelButtonClick);
}

export function showModal(productId, status) {
    currentProductId = productId;
    currentStatus = status;

    const modal = document.getElementById('confirmationModal');
    const modalMessage = document.getElementById('modalMessage');

    modalMessage.innerText = status
        ? 'O produto será desativado. Você tem certeza?'
        : 'O produto será ativado. Você tem certeza?';

    modal.style.display = 'flex';
}

async function handleConfirmButtonClick() {
    const modal = document.getElementById('confirmationModal');
    modal.style.display = 'none';

    try {
        await toggleProductStatus(currentProductId, !currentStatus);
        fetchProducts(1, document.getElementById('campoPesquisa').value);
    } catch (error) {
        console.error('Erro ao alternar status do produto:', error);
        alert('Erro ao alternar status do produto. Tente novamente.');
    }
}

function handleCancelButtonClick() {
    const modal = document.getElementById('confirmationModal');
    modal.style.display = 'none';
}