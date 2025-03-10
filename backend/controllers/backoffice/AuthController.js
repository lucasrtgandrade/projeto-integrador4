const ColaboradorModel = require('../../models/backoffice/ColaboradorModel');
const { compareSenha } = require('../../utils/auth');

class AuthController {
    static renderizarPaginaLogin(req, res) {
        res.render('backoffice/auth/', { title: 'Login Backoffice' });
    }

    static async loginBackOffice(req, res) {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.json({ success: false, message: 'Email e senha são obrigatórios' });
        }

        try {
            const colaborador = await ColaboradorModel.encontrarEmail(email);
            if (!colaborador) {
                return res.json({ success: false, message: 'Email não cadastrado' });
            }


            const senhaValida = await compareSenha(senha, colaborador.senha);
            if (!senhaValida) {
                return res.json({ success: false, message: 'Email ou senha inválidos' });
            }

            if (colaborador.status !== 1) {
                return res.json({ success: false, message: 'Usuário inativo. Entre em contato com o suporte.' });
            }

            req.session.user = {
                id: colaborador.colaborador_id,
                email: colaborador.email,
                cargo_id: colaborador.cargo_id
            };

            let rotaDestino = '/';
            if (colaborador.cargo_id === 1) {
                rotaDestino = '/backoffice/administrador/';
            } else if (colaborador.cargo_id === 2) {
                rotaDestino = '/backoffice/estoquista/';
            }

            return res.json({ success: true, message: 'Login realizado com sucesso!', redirect: rotaDestino });

        } catch (error) {
            console.log('Erro no login:', error);
            return res.json({ success: false, message: 'Erro no servidor' });
        }
    }

}

module.exports = AuthController;
