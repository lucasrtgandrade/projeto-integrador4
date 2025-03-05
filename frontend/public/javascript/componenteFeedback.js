export function limparFeedback(feedbackMensagem, feedbackContainer) {
    feedbackMensagem.textContent = ' ';
    feedbackMensagem.classList.remove('feedback--texto');
    feedbackContainer.classList.add('feedback--erro');
}

export function exibirFeedback(feedbackMensagem, mensagem, feedbackContainer) {
    feedbackMensagem.textContent = mensagem;
    feedbackMensagem.classList.add('feedback--texto');
    feedbackContainer.classList.add('feedback--erro');
}