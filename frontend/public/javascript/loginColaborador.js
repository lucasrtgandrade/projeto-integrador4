document.getElementById('form-login-colaborador').addEventListener('submit', (e) => {
    e.preventDefault();

    const inputEmailColaborador = document.getElementById('input-email-colaborador').value;
    const inputSenhaColaborador = document.getElementById('input-senha-colaborador').value;
    const textFeedbackFrontEnd = document.getElementById('texto-feedback-frontend');

    // Criar um objeto com os valores do input
    const dados = {
        email: inputEmailColaborador,
        senha: inputSenhaColaborador,
    };

    // Enviar os dados para o servidor usando fetch
    fetch('http://localhost:3030/backoffice/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    })
        .then(response => response.json())
        .then(dados => {
            if (dados.success) {
                // Se o login for bem-sucedido, redireciona para a página apropriada
                window.location.href = dados.redirect; // redireciona para a URL passada do backend
                textFeedbackFrontEnd.innerHTML = 'Login realizado com sucesso!';
            } else {
                // Se não for bem-sucedido, exibe a mensagem de erro
                textFeedbackFrontEnd.innerHTML = dados.message || 'Email ou senha inválidos';
            }
        })
        .catch(error => {
            console.log('Erro:', error);
            textFeedbackFrontEnd.innerHTML = 'Erros acontecem';
        });
});
