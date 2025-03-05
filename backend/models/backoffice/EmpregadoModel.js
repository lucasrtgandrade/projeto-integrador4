// backend/models/backoffice/EmpregadoModel.js
const pool = require('../../db');

class EmpregadoModel {
    // Verifica se o e-mail enviado pelo usuário está no banco
    static async encontrarEmail(email) {
        const [colunas] = await pool.query('SELECT * FROM funcionarios WHERE email = ?', [email]);
        return colunas[0];
    }

    // Verifica se a situação do usuário está ativa
    static async verificarStatus(id_funcionario) { // Use the correct column name
        const [colunas] = await pool.query('SELECT situacao FROM funcionarios WHERE id_funcionario = ?', [id_funcionario]);
        return colunas[0]?.situacao;
    }

    // Listar Usuários
    static async listarEmpregados() {
        const [empregados] = await pool.query('SELECT id_funcionario, nome, email, situacao FROM funcionarios');
        return empregados
    }

    // Atualizar Status
    static async atualizarStatus(id_funcionario, situacao) {
        await pool.query('UPDATE funcionarios SET situacao = ? WHERE id_funcionario = ?', [situacao, id_funcionario]);
    }

    // Atualizar informações do funcionário
    static async atualizarUsuario(id_funcionario, { nome, email, id_cargo, situacao }) {
        await pool.query(
            'UPDATE funcionarios SET nome = ?, email = ?, id_cargo = ?, situacao = ? WHERE id_funcionario = ?',
            [nome, email, id_cargo, situacao, id_funcionario]
        );
    }

    // Encontrar funcionário por ID
    static async encontrarPorId(id_funcionario) {
        const [colunas] = await pool.query('SELECT * FROM funcionarios WHERE id_funcionario = ?', [id_funcionario]);
        return colunas[0];
    }
}

module.exports = EmpregadoModel;