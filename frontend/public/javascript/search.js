import { fetchProducts } from '../utils/api.js';

export function setupSearch() {
    const searchInput = document.getElementById('campoPesquisa');

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value;
        fetchProducts(1, searchTerm);
    });
}