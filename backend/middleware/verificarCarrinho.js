const CarrinhoModel = require('../models/CarrinhoModel');

async function verificarCarrinho(req, res, next) {
    try {
        if (!req.session.idCarrinho) {
            const idClienteSessao = req.sessionID; // ou gere um identificador
            const novoCarrinhoId = await CarrinhoModel.criarCarrinhoParaSessao(idClienteSessao);
            req.session.idCarrinho = novoCarrinhoId;
        }

        next();
    } catch (error) {
        console.error('Erro ao verificar ou criar carrinho:', error);
        res.status(500).send('Erro ao inicializar carrinho');
    }
}

module.exports = verificarCarrinho;
