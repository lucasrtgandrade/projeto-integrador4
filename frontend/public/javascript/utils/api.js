const API_BASE_URL = '/backoffice/administrador/listar-produtos/api';

export async function fetchProducts(page = 1, searchTerm = '') {
    try {
        const response = await fetch(`${API_BASE_URL}?pagina=${page}&termoPesquisa=${searchTerm}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar produtos');
        }
        const data = await response.json();

        renderProducts(data.produtos);
        renderPagination(data.totalPaginas, data.pagina);
    } catch (error) {
        console.error(error);
        alert('Erro ao buscar produtos. Tente novamente.');
    }
}

export async function toggleProductStatus(productId, status) {
    try {
        const response = await fetch(`/backoffice/administrador/alternar-status-produto/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error('Erro ao alternar status do produto');
        }

        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

function renderProducts(products) {
    const tableBody = document.getElementById('corpoTabelaProdutos');
    tableBody.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.produto_id}</td>
            <td>${product.nome}</td>
            <td>R$ ${Number(product.preco).toFixed(2)}</td>
            <td>${product.qtd_estoque}</td>
            <td id="status-${product.produto_id}">
                ${product.status ? 'Ativo' : 'Inativo'}
            </td>
            <td>
                <button onclick="showModal(${product.produto_id}, ${product.status})">
                    ${product.status ? 'Desativar' : 'Reativar'}
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}