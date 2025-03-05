const ColaboradorModel = require('../../models/backoffice/ColaboradorModel')
const { compareSenha } = require('../../utils/auth')

class AdministradorController {
    static renderizarPaginaIndex(req, res) {
        res.render('backoffice/administrador/index', { title: 'Administrador' } );
    }

    static renderizarPaginaColaborador(req, res) {
        res.render('backoffice/administrador/colaboradores', { title: 'Colaborador' } );
    }

    static renderizarPaginaAdicionarColaborador(req, res) {
        res.render('backoffice/administrador/adicionar-colaborador')
    }

    static renderizarPaginaEditarColaborador(req, res) {
        res.render('backoffice/administrador/editar-colaborador')
    }

    static renderizarPaginaProdutos(req, res) {
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