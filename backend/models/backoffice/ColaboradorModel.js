const pool = require('../../config/db');
const { encripteSenha } = require('../../utils/auth');

class ColaboradorModel {
    static async encontrarEmail(email) {
        const [linhas] = await pool.query('SELECT * FROM colaboradores WHERE email = ?', [email]);
        return linhas[0];
    }

    static async verificarStatus(colaborador_id) {
        const [linhas] = await pool.query('SELECT status FROM colaboradores WHERE colaborador_id = ?', [colaborador_id])
        return linhas[0]?.status
    }

    static async listarColaboradores() {
        const [colaboradores] = await pool.query('SELECT colaborador_id, nome, email, status, cargo_id FROM colaboradores');
        return colaboradores;
    }

    static async encontrarPorId(colaborador_id) {
        const resultado = await pool.query('SELECT * FROM colaboradores WHERE colaborador_id = ?', [colaborador_id]);
        return resultado[0];
    }

    static async alterarStatusColaborador(colaborador_id) {
        const [linha] = await pool.query('SELECT status FROM colaboradores WHERE colaborador_id = ?', [colaborador_id]);
        if (linha.length === 0) {
            throw new Error('Colaborador não encontrado');
        }
        const atualStatus = linha[0].status;
        const novoStatus = atualStatus === 1 ? 0 : 1; // Toggle status

        const [resultado] = await pool.query('UPDATE colaboradores SET status = ? WHERE colaborador_id = ?', [novoStatus, colaborador_id]);


        if (resultado.affectedRows === 0) {
            throw new Error('Nenhuma linha afetada, colaborador não encontrado');
        }

        return novoStatus;
    }

    static async alterarDadosColaborador(colaborador_id, nome, cpf, senha, cargo_id) {
        let query = 'UPDATE colaboradores SET nome = ?, cpf = ?, cargo_id = ?';
        const params = [nome, cpf, cargo_id];

        // Se uma nova senha foi fornecida, adicionar ao query
        if (senha) {
            const senhaEncriptada = await encripteSenha(senha);
            query += ', senha = ?';
            params.push(senhaEncriptada);
        }

        query += ' WHERE colaborador_id = ?';
        params.push(colaborador_id);

        const [resultado] = await pool.query(query, params);

        if (resultado.affectedRows === 0) {
            throw new Error('Nenhuma linha afetada, colaborador não encontrado');
        }
    }

    static async cadastrarColaborador({ nome, cpf, email, senha, status, cargo_id }) {
        const senhaEncriptada = await encripteSenha(senha);
        await pool.query(
            'INSERT INTO colaboradores (nome, cpf, email, senha, status, cargo_id) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, cpf, email, senhaEncriptada, status, cargo_id]
        );
    }

    static async pesquisarColaborador(termoPesquisado) {
        const [resultado] = await pool.query('SELECT * FROM colaboradores WHERE nome LIKE ?', [`%${termoPesquisado}%`]);
        return resultado;
    }
}

module.exports = ColaboradorModel;