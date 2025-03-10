// Helper function to validate a CPF
function validarCPF(cpf) {
    // Remove non-numeric characters
    cpf = cpf.replace(/\D/g, '');

    // Check if the CPF has 11 digits
    if (cpf.length !== 11) {
        return false;
    }

    // Check if all digits are the same (e.g., 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    // Validate the CPF using the algorithm
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

// Middleware to validate CPF
const validarCPFMiddleware = (req, res, next) => {
    const { cpf } = req.body;

    // Check if CPF is provided
    if (!cpf) {
        return res.status(400).json({ success: false, message: 'CPF é obrigatório.' });
    }

    // Validate the CPF
    const cpfValido = validarCPF(cpf);

    if (!cpfValido) {
        return res.status(400).json({ success: false, message: 'CPF inválido.' });
    }

    // If CPF is valid, proceed to the next middleware or route handler
    next();
};

module.exports = validarCPFMiddleware;