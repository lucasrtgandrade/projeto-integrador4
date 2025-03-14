document.addEventListener('DOMContentLoaded', () => {
    let imagensProduto = [];
    let indiceAtual = 0;

    async function buscarProdutos(pagina = 1, termoPesquisa = '') {
        try {
            console.log("📡 Fetching products from API...");
            const resposta = await fetch(`/backoffice/estoquista/listar-produtos/api?pagina=${pagina}&termoPesquisa=${termoPesquisa}`);

            if (!resposta.ok) throw new Error('Erro ao buscar produtos');

            const dados = await resposta.json();
            console.log("✅ API Response Data:", dados);

            const corpoTabela = document.getElementById('corpoTabelaProdutos');
            corpoTabela.innerHTML = '';

            if (dados.produtos.length === 0) {
                corpoTabela.innerHTML = `<tr><td colspan="5">Nenhum produto encontrado</td></tr>`;
                return;
            }

            dados.produtos.forEach(produto => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${produto.produto_id}</td>
                    <td>${produto.nome}</td>
                    <td>${produto.qtd_estoque}</td>
                    <td>R$ ${Number(produto.preco).toFixed(2)}</td>
                    <td>
                        <div class="acoes-container">
                            <a href="/backoffice/estoquista/alterar-produto/${produto.produto_id}" class="botao-editar">
                                ✏️ Editar
                            </a>
                            <button class="botao-visualizar" onclick="visualizarProduto(${produto.produto_id})">
                                👀 Visualizar
                            </button>
                        </div>
                    </td>
                `;
                corpoTabela.appendChild(linha);
            });

        } catch (error) {
            console.error("❌ Error fetching products:", error);
            alert('Erro ao buscar produtos. Tente novamente.');
        }
    }

    async function visualizarProduto(produtoId) {
        try {
            console.log(`📡 Fetching product details for ID: ${produtoId}`);

            const response = await fetch(`/backoffice/estoquista/produto/${produtoId}`);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const produto = await response.json();
            console.log("✅ Product Details:", produto);

            // Ensure the modal exists
            const modal = document.getElementById('modalVisualizar');
            if (!modal) {
                console.error("❌ Error: Modal 'modalVisualizar' not found in the DOM!");
                return;
            }

            // Populate modal data
            document.getElementById('previewNome').innerText = produto.nome;
            document.getElementById('previewEstoque').innerText = produto.qtd_estoque;

            // Image carousel
            const carousel = document.getElementById('carousel');
            if (!carousel) {
                console.error("❌ Error: Carousel not found in the DOM!");
                return;
            }

            carousel.innerHTML = ''; // Clear previous images
            imagensProduto = produto.imagens; // Store images globally
            indiceAtual = 0; // Start from the first image

            if (imagensProduto.length === 0) {
                carousel.innerHTML = `<p>Sem imagens disponíveis</p>`;
                return;
            }

            imagensProduto.forEach((imagem, index) => {
                const imgElement = document.createElement('img');
                imgElement.src = `/uploads/${imagem.url}`;
                imgElement.classList.add(index === 0 ? 'active' : 'hidden');
                carousel.appendChild(imgElement);
            });

            modal.style.display = 'flex'; // Show modal
        } catch (error) {
            console.error("❌ Error fetching product details:", error);
            alert('Erro ao visualizar produto.');
        }
    }

    function fecharModalVisualizar() {
        document.getElementById('modalVisualizar').style.display = 'none';
    }

    function mudarSlide(direction) {
        if (imagensProduto.length === 0) return;

        const carouselImages = document.querySelectorAll("#carousel img");
        if (carouselImages.length === 0) return;

        // Hide current image
        carouselImages[indiceAtual].classList.remove('active');
        carouselImages[indiceAtual].classList.add('hidden');

        // Change index
        indiceAtual += direction;
        if (indiceAtual < 0) {
            indiceAtual = imagensProduto.length - 1;
        } else if (indiceAtual >= imagensProduto.length) {
            indiceAtual = 0;
        }

        // Show new image
        carouselImages[indiceAtual].classList.remove('hidden');
        carouselImages[indiceAtual].classList.add('active');
    }

    document.getElementById('campoPesquisa').addEventListener('input', () => {
        buscarProdutos(1, document.getElementById('campoPesquisa').value);
    });

    buscarProdutos(1, '');

    // ✅ Make functions accessible globally
    window.visualizarProduto = visualizarProduto;
    window.fecharModalVisualizar = fecharModalVisualizar;
    window.mudarSlide = mudarSlide;
});
