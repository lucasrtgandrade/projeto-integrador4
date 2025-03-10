import { fetchProducts } from '../utils/api.js';

export function setupPagination() {
    const paginationContainer = document.getElementById('paginacao');

    paginationContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'A') {
            event.preventDefault();
            const page = parseInt(event.target.innerText);
            const searchTerm = document.getElementById('campoPesquisa').value;
            fetchProducts(page, searchTerm);
        }
    });
}

export function renderPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('paginacao');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const link = document.createElement('a');
        link.href = '#';
        link.innerText = i;
        link.className = i === currentPage ? 'ativo' : '';
        paginationContainer.appendChild(link);
    }
}