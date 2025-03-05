const ColaboradorModel = require('../../models/backoffice/ColaboradorModel')
const { compareSenha } = require('../../utils/auth')

class AdministradorController {
    renderizarPaginaIndex(req, res) {
        res.render('backoffice/administrador/index', { title: 'Administrador' } );
    }

    renderizarPaginaColaborador(req, res) {
        res.render('backoffice/administrador/colaboradores', { title: 'Colaborador' } );
    }

    renderizarPaginaProdutos(req, res) {
        res.render('backoffice/administrador/produtos', { title: 'Produtos' });
    }

    static async listarColaboradores(req, res) {
        try {
            const colaboradores = await ColaboradorModel.listarColaboradores();
            res.render('backoffice/listar-colaboradores', { colaboradores });
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    }
}

module.exports = AdministradorController;