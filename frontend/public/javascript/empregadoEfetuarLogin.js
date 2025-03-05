import { limparFeedback, exibirFeedback } from './componenteFeedback.js';

document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackMensagem = document.getElementById('feedback-mensagem');
    limparFeedback(feedbackMensagem, feedbackContainer);

    if (!email || !senha) {
        exibirFeedback(feedbackMensagem, 'Por favor, preencha todos os campos', feedbackContainer);
        return;
    }

    try {
        const resposta = await fetch('http://localhost:3000/backoffice/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email, senha}),
        });

        const dado = await resposta.json();

        if (resposta.ok) {
            window.location.href = dado.redirect;
        } else {
            exibirFeedback(feedbackMensagem, dado.error || 'Erro ao logar', feedbackContainer);
        }
    } catch (error) {
        exibirFeedback(feedbackMensagem, 'Ocorreu um erro com o servidor', feedbackContainer);
    }
});