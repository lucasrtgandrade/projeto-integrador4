import { fetchProducts } from '../utils/api.js';
import { setupSearch } from './search.js';
import { setupPagination } from './paginacao.js';
import { setupModal } from './modal-confirmacao.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize product listing
    fetchProducts(1, '');

    // Set up search functionality
    setupSearch();

    // Set up pagination
    setupPagination();

    // Set up modal functionality
    setupModal();
});