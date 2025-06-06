document.addEventListener('DOMContentLoaded', () => {
    let currentProdutoId = null;
    let currentStatus = null;
    let imagensProduto = [];
    let indiceAtual = 0;

    function exibirAvaliacao(avaliacao) {
        const estrelaCheia = '★';
        const estrelaMeia = '⯪'; // ou 🌓, ou ✬, ou uma imagem SVG
        const estrelaVazia = '☆';

        let estrelas = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(avaliacao)) {
                estrelas += estrelaCheia;
            } else if (i - avaliacao <= 0.5) {
                estrelas += estrelaMeia;
            } else {
                estrelas += estrelaVazia;
            }
        }

        return estrelas;
    }

    async function visualizarProduto(produtoId) {
        try {
            const response = await fetch(`/backoffice/administrador/produto/${produtoId}`);
            if (!response.ok) throw new Error('Erro ao carregar detalhes do produto.');

            const produto = await response.json();

            document.getElementById('previewNome').innerText = produto.nome;
            document.getElementById('previewAvaliacao').innerHTML = exibirAvaliacao(produto.media_avaliacao);
            document.getElementById('previewEstoque').innerText = produto.qtd_estoque;



            imagensProduto = produto.imagens;
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
        if (!carousel) return;

        carousel.innerHTML = ''; // Clear previous images

        if (imagensProduto.length === 0) {
            carousel.innerHTML = '<p>Sem imagens disponíveis</p>';
            return;
        }

        imagensProduto.forEach((imagem, index) => {
            const imgElement = document.createElement('img');
            imgElement.src = `/uploads/${imagem.url}`;
            imgElement.classList.add(index === indiceAtual ? 'active' : 'hidden'); // ✅ Show active image
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

        atualizarCarrossel(); // Refresh to show new active image
    }

    function mostrarModal(produtoId, statusAtual) {
        currentProdutoId = produtoId;
        currentStatus = statusAtual;

        const modal = document.getElementById('confirmationModal');
        const modalMessage = document.getElementById('modalMessage');

        modalMessage.innerText = statusAtual
            ? 'O produto será desativado. Você tem certeza?'
            : 'O produto será ativado. Você tem certeza?';

        modal.style.display = 'flex';
    }

    async function confirmarAlternarStatus() {
        document.getElementById('confirmationModal').style.display = 'none';
        await alternarStatus(currentProdutoId, currentStatus);
    }

    function cancelarAlternarStatus() {
        document.getElementById('confirmationModal').style.display = 'none';
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
                const termoPesquisa = document.getElementById('campoPesquisa').value;
                await buscarProdutos(1, termoPesquisa);
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

    document.getElementById('confirmButton').addEventListener('click', confirmarAlternarStatus);
    document.getElementById('cancelButton').addEventListener('click', cancelarAlternarStatus);
    document.getElementById('campoPesquisa').addEventListener('input', () => {
        buscarProdutos(1, document.getElementById('campoPesquisa').value);
    });

    buscarProdutos(1, '');
});
