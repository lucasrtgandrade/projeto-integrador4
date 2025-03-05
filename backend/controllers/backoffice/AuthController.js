const ColaboradorModel = require('../../models/backoffice/ColaboradorModel')
const { compareSenha } = require('../../utils/auth')


class AuthController {
    static async acessoBackOffice(req, res) {
        const { email, senha } = req.body;

        try {
            const colaborador = await ColaboradorModel.encontrarEmail(email);
            if (!colaborador) {
                return res.status(401).json({ error: 'Email ou senha incorretos' });
            }
            const isIgual = await compareSenha(senha, colaborador.senha);
            if (!isIgual) {
                return res.status(401).json({ error: 'Email ou senha incorretos' });
            }
            if (!colaborador.status) {
                return res.status(403).json({ error: 'Sua conta está inativada. Entre em contato com um administrador' });
            }
            req.session.user = {
                colaborador_id: colaborador.colaborador_id,
                email: colaborador.email,
                cargo_id: colaborador.cargo_id,
                status: colaborador.status,
            };
            if (colaborador.cargo_id === 1) {
                return res.status(200).json({ redirect: '/backoffice/administrador/index' });
            } else if (colaborador.cargo_id === 2) {
                return res.status(200).json({ redirect: '/backoffice/estoquista/index' });
            } else {
                return res.status(403).json({ error: 'Acesso restrito apenas para funcionários' });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AuthController;