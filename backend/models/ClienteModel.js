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

    static async atualizarCliente(clienteId, dados) {
        const campos = [];
        const valores = [];

        for (const campo in dados) {
            campos.push(`${campo} = ?`);
            valores.push(dados[campo]);
        }

        valores.push(clienteId); // último valor para o WHERE

        const sql = `UPDATE clientes SET ${campos.join(', ')} WHERE id_cliente = ?`;

        await pool.query(sql, valores);
    }

    static async encontrarCliente(id_cliente) {
        const sql = `SELECT * FROM clientes WHERE id_cliente = ?`;
        const [dados] = await pool.query(sql, [id_cliente]);
        return dados;
    }

}

module.exports = ClienteModel;