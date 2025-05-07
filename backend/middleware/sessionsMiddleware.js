const session = require('express-session');

const sessionMiddleware = session({
    secret: '123', // para teste
    // secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: false }, // True se estiver usando HTTPS
    cookie: {
        maxAge:  60 * 60 * 1000 // 1 hora
    }
});

function exigirLogin(req, res, next) {
    if (req.session.user) { // ✅ Corrected: `req.session.user`
        next();
    } else {
        res.status(401).json({ success: false, message: 'Não Autorizado' });
    }
}

function exigirAdministrador(req, res, next) {
    if (req.session.user && req.session.user.cargo_id === 1) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Acesso negado' });
    }
}

function exigirEstoquista(req, res, next) {
    if (req.session.user && req.session.user.cargo_id === 2) { // Estoquista = cargo_id 2
        return next();
    }
    return res.status(403).json({ success: false, message: 'Acesso negado' });
}

module.exports = { sessionMiddleware, exigirLogin, exigirAdministrador, exigirEstoquista };
