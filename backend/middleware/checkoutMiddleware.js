module.exports = (req, res, next) => {
    if (!req.session.checkout) {
        req.session.checkout = {
            cliente: {},
            endEntrega: {},
            carrinho: {
                itens: [],
                frete: {}
            },
            pagamento: {},
            resumo: {}
        };
    }

    next();
};