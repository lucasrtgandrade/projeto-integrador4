function validarSenhaMiddleware(req, res, next) {
    const { senha, confirmarSenha } = req.body;

    if (senha !== confirmarSenha) {
        return res.status(400).json({ success: false, message: 'As senhas não coincidem' });
    }

    next();
}

module.exports = validarSenhaMiddleware;