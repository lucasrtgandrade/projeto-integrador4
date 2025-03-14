// Função para exibir a prévia das imagens enviadas
document.getElementById('imagens').addEventListener('change', function (event) {
    const container = document.getElementById('imagem-container');
    container.innerHTML = ''; // Limpa imagens anteriores

    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Imagem do Produto';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'imagem_principal';
            radio.value = i; // Usa o índice para identificar a imagem principal

            const label = document.createElement('label');
            label.appendChild(radio);
            label.appendChild(img);

            container.appendChild(label);
        };

        reader.readAsDataURL(file);
    }
});
