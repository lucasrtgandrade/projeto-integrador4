function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11) {
        return false;
    }

    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.charAt(9))) {
        return false;
    }

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.charAt(10))) {
        return false;
    }

    return true;
}

const validarCPFMiddleware = (req, res, next) => {
    const { cpf } = req.body;

    if (!cpf) {
        return res.status(400).json({ success: false, mensagem: 'CPF é obrigatório.' });
    }

    const cpfValido = validarCPF(cpf);

    if (!cpfValido) {
        return res.status(400).json({ success: false, mensagem: 'CPF inválido.' });
    }

    next();
};

module.exports = {
    validarCPF,
    validarCPFMiddleware
};
