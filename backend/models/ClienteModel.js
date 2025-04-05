const pool = require('../config/db');

class ClienteModel {
    static async encontrarEmail(email) {
        const [linhas] = await pool.query(
            'SELECT * FROM clientes WHERE email = ?', [email]
        );
        return linhas[0];
    }

    static async encontrarCpf(cpf) {
        const [linhas] = await pool.query(
            'SELECT * FROM clientes WHERE cpf = ?', [cpf]
        );
        return linhas[0];
    }

    static async adicionarCliente({ nome_completo, email, cpf, senha, data_nascimento, genero }) {
        const sql = `
            INSERT INTO clientes (nome_completo, email, cpf, senha, data_nascimento, genero)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [resultado] = await pool.query(sql, [nome_completo, email, cpf, senha, data_nascimento, genero]);
        return resultado;
    }
}

module.exports = ClienteModel;