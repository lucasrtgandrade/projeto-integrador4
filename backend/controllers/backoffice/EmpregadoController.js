// backend/controllers/backoffice/EmpregadoController.js
const EmpregadoModel = require('../../models/backoffice/EmpregadoModel');
const { compareSenha } = require('../../utils/auth');

class EmpregadoController {
    static renderizarPagina(req, res) {
        res.render('backoffice/login', { title: 'Login' });
    }



    // Renderizar a lista de funcionários na página
    static async listarEmpregado(req, res) {
        try {
            const empregados = await EmpregadoModel.listarEmpregados();
            res.render('backoffice/listar-usuarios', {empregados});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Atualizar situação do funcionário
    static async atualizarStatus(req, res) {
        const { id_funcionario, situacao } = req.body;
        try {
            await EmpregadoModel.atualizarStatus(id_funcionario, situacao);
            res.status(200).json({ success: true});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Renderizar página de edição de funcionário
    static async renderizarEditarUsuario(req, res) {
        const { id } = req.params;

        try {
            const empregado = await EmpregadoModel.encontrarPorId(id);
            res.render('backoffice/editar-usuario', { empregado });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Atualizar informações do funcionário
    static async atualizarUsuario(req, res) {
        const { id } = req.params;
        const { nome, email, id_cargo, situacao } = req.body;

        try {
            await EmpregadoModel.atualizarUsuario(id, { nome, email, id_cargo, situacao });
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = EmpregadoController;