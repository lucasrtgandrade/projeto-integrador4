// Define global variables
let imagensProduto = [];
let indiceAtual = 0;

function exibirAvaliacao(avaliacao) {
    const estrelaCheia = '★'; // Full star
    const estrelaVazia = '☆'; // Empty star
    const maxEstrelas = 5;
    let estrelas = '';

    for (let i = 1; i <= maxEstrelas; i++) {
        if (i <= avaliacao) {
            estrelas += estrelaCheia; // Full star if within the rating
        } else {
            estrelas += estrelaVazia; // Empty star if above the rating
        }
    }

    return estrelas;
}


async function visualizarProduto(produtoId) {
    try {
        const response = await fetch(`/backoffice/administrador/produto/${produtoId}`);
        if (!response.ok) throw new Error('Erro ao carregar detalhes do produto.');

        const produto = await response.json();

        // Check if elements exist before updating
        const previewNome = document.getElementById('previewNome');
        const previewAvaliacao = document.getElementById('previewAvaliacao');
        const previewEstoque = document.getElementById('previewEstoque');

        if (!previewNome || !previewAvaliacao || !previewEstoque) {
            throw new Error('Elementos do modal não encontrados no DOM.');
        }

        previewNome.innerText = produto.nome;
        previewAvaliacao.innerText = produto.media_avaliacao !== undefined
            ? produto.media_avaliacao.toFixed(1)
            : 'N/A';
        previewEstoque.innerText = produto.qtd_estoque;

        imagensProduto = produto.imagens;
        indiceAtual = 0;
        atualizarCarrossel();

        document.getElementById('modalVisualizar').style.display = 'flex';

    } catch (error) {
        console.error(error);
        alert('Erro ao visualizar produto.');
    }
}

function fecharModalVisualizar() {
    document.getElementById('modalVisualizar').style.display = 'none';
}

function atualizarCarrossel() {
    const carousel = document.getElementById('carousel');
    if (!carousel || imagensProduto.length === 0) return;

    carousel.innerHTML = ''; // Clear previous images

    imagensProduto.forEach((imagem, index) => {
        const imgElement = document.createElement('img');
        imgElement.src = `/uploads/${imagem.url}`;
        imgElement.classList.add('carousel-image');
        imgElement.style.display = index === indiceAtual ? 'block' : 'none'; // Show only active image
        carousel.appendChild(imgElement);
    });
}

function mudarSlide(direction) {
    if (imagensProduto.length === 0) return;

    indiceAtual += direction;
    if (indiceAtual < 0) {
        indiceAtual = imagensProduto.length - 1;
    } else if (indiceAtual >= imagensProduto.length) {
        indiceAtual = 0;
    }

    atualizarCarrossel();
}

function mostrarModal(produtoId, statusAtual) {
    const modal = document.getElementById('confirmationModal');
    const modalMessage = document.getElementById('modalMessage');

    modalMessage.innerText = statusAtual
        ? 'O produto será desativado. Você tem certeza?'
        : 'O produto será ativado. Você tem certeza?';

    modal.style.display = 'flex';
}

async function alternarStatus(produtoId, statusAtual) {
    try {
        const resposta = await fetch(`/backoffice/administrador/alternar-status-produto/${produtoId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: !statusAtual })
        });

        if (!resposta.ok) throw new Error('Erro ao alternar status do produto');

        const dados = await resposta.json();

        if (dados.sucesso) {
            buscarProdutos(1, document.getElementById('campoPesquisa').value);
        } else {
            throw new Error('Erro ao alternar status do produto');
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao alternar status do produto. Tente novamente.');
    }
}

async function buscarProdutos(pagina = 1, termoPesquisa = '') {
    try {
        const resposta = await fetch(`/backoffice/administrador/listar-produtos/api?pagina=${pagina}&termoPesquisa=${termoPesquisa}`);
        if (!resposta.ok) throw new Error('Erro ao buscar produtos');

        const dados = await resposta.json();

        const corpoTabela = document.getElementById('corpoTabelaProdutos');
        corpoTabela.innerHTML = '';

        dados.produtos.forEach(produto => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${produto.produto_id}</td>
                <td>${produto.nome}</td>
                <td>${produto.qtd_estoque}</td>
                <td>R$ ${Number(produto.preco).toFixed(2)}</td>
                <td id="status-${produto.produto_id}">
                    ${produto.status ? 'Ativo' : 'Inativo'}
                </td>
                <td>
                    <div class="acoes-container">
                        <button onclick="mostrarModal(${produto.produto_id}, ${produto.status})">
                            ${produto.status ? 'Desativar' : 'Reativar'}
                        </button>
                        <a href="/backoffice/administrador/alterar-produto/${produto.produto_id}" class="botao-alterar">
                            Editar
                        </a>
                        <button class="botao-visualizar" onclick="visualizarProduto(${produto.produto_id})">
                            Visualizar
                        </button>
                    </div>
                </td>
            `;
            corpoTabela.appendChild(linha);
        });

        const paginacao = document.getElementById('paginacao');
        paginacao.innerHTML = '';

        for (let i = 1; i <= dados.totalPaginas; i++) {
            const link = document.createElement('a');
            link.href = '#';
            link.innerText = i;
            link.className = i === dados.pagina ? 'ativo' : '';
            link.onclick = () => {
                buscarProdutos(i, termoPesquisa);
                return false;
            };
            paginacao.appendChild(link);
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao buscar produtos. Tente novamente.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('confirmButton').addEventListener('click', async () => {
        document.getElementById('confirmationModal').style.display = 'none';
        await alternarStatus(currentProdutoId, currentStatus);
    });

    document.getElementById('cancelButton').addEventListener('click', () => {
        document.getElementById('confirmationModal').style.display = 'none';
    });

    document.getElementById('campoPesquisa').addEventListener('input', () => {
        buscarProdutos(1, document.getElementById('campoPesquisa').value);
    });

    buscarProdutos(1, '');
});

// ✅ **Make Functions Global**
window.visualizarProduto = visualizarProduto;
window.fecharModalVisualizar = fecharModalVisualizar;
window.mudarSlide = mudarSlide;
window.buscarProdutos = buscarProdutos;
window.mostrarModal = mostrarModal;
