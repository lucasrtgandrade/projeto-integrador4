document.getElementById('form-alterar-colaborador').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const colaboradorId = window.location.pathname.split('/').pop();

    try {
        const response = await fetch(`/backoffice/administrador/alterar-colaborador/${colaboradorId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: formData.get('nome'),
                cpf: formData.get('cpf'),
                senha: formData.get('senha'),
                confirmarSenha: formData.get('confirmarSenha'),
                cargo_id: formData.get('cargo_id')
            })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            window.location.href = '/backoffice/administrador/listar-colaboradores';
        } else {
            document.getElementById('error-message').textContent = result.message;
        }
    } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        document.getElementById('error-message').textContent = 'Erro ao enviar formulário. Tente novamente.';
    }
});
