// backend/middleware/backoffice/authMiddleware.js
function estaAutenticado(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.status(401).json({ error: 'Não autorizado' });
}

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.id_cargo === 1 && req.session.user.situacao === true) {
        return next();
    }
    res.status(403).json({ error: 'Acesso de administrador não autorizado' });
}

function isEstoquista(req, res, next) {
    if (req.session.user && req.session.user.id_cargo === 2 && req.session.user.situacao === true) {
        return next();
    }
    res.status(403).json({ error: 'Acesso de estoquista não autorizado' });
}

module.exports = { estaAutenticado, isAdmin, isEstoquista };