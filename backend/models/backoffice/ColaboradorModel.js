const pool = require('../../db');
const { encripteSenha } = require('../../utils/auth');

class ColaboradorModel {
    static async encontrarEmail(email) {
        const [linhas] = await pool.query('SELECT * FROM colaboradores WHERE email = ?', [email])
        return linhas[0]
    }

    static async verificarStatus(colaborador_id) {
        const [linhas] = await pool.query('SELECT status FROM colaboradores WHERE colaborador_id = ?', [colaborador_id])
        return linhas[0]?.status
    }

    static async listarColaboradores() {
        const [colaboradores] = await pool.query('SELECT colaborador_id, nome, email, status, cargo_id FROM colaboradores');
        return colaboradores
    }

    static async alterarStatusColaborador(status, colaborador_id, ) {
        await pool.query('UPDATE colaboradores SET status = ? WHERE colaborador_id = ?', [status, colaborador_id]);
    }

    static async alterarDadosColaborador(nome, cpf, senha, cargo_id) {
        const senhaEncriptada = await encripteSenha(senha);
        await pool.query('UPDATE colaboradores SET nome = ?, cpf = ?, senha = ?, cargo_id = ? WHERE colaborador_id = ?', [nome, cpf, senhaEncriptada, cargo_id]);
    }

    static async cadastrarColaborador({nome, cpf, email, senha, status, cargo_id}) {
        const senhaEncriptada = await encripteSenha(senha);
        await pool.query('INSERT INTO colaboradores (nome, cpf, email, senha, status, cargo_id) VALUES (?, ?, ?, ?, ?, ?)', [nome, cpf, email, senhaEncriptada, status, cargo_id]);
    }

    static async pesquisarColaborador(termoPesquisado) {
        const [resultado] = await pool.query('SELECT * FROM colaboradores WHERE nome LIKE ?', [`%${termoPesquisado}%`]);
        return resultado;
    }
}

module.exports = ColaboradorModel;