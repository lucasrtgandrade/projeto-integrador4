const pool = require('../config/db');

class EnderecoModel {
    // Endereço de Faturamento - usado no cadastro do cliente
    static async adicionarEnderecoFaturamento({
                                                  id_cliente,
                                                  cep,
                                                  logradouro,
                                                  numero,
                                                  complemento,
                                                  bairro,
                                                  cidade,
                                                  uf
                                              }) {
        const sql = `
            INSERT INTO enderecos (
                id_cliente, cep, logradouro, numero, complemento,
                bairro, cidade, uf, tipo, padrao
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [resultado] = await pool.query(sql, [
            id_cliente,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            uf,
            'FATURAMENTO', // tipo
            1              // padrao (1 = true)
        ]);

        return resultado;
    }

    // Endereço de entrega - usado no adicionar-endereco.ejs
    static async adicionarEnderecoEntrega({
                                              id_cliente,
                                              cep,
                                              logradouro,
                                              numero,
                                              complemento,
                                              bairro,
                                              cidade,
                                              uf,
                                              padrao
                                          }) {
        const sql = `
            INSERT INTO enderecos (
                id_cliente, cep, logradouro, numero,
                complemento, bairro, cidade, uf, tipo, padrao
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await pool.query(sql, [
            id_cliente,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            uf,
            'ENTREGA', // tipo
            padrao     // 1 ou 0
        ]);
    }

    // Zera todos os endereços "padrão" de um cliente
    static async removerEnderecoPadrao(id_cliente) {
        const sql = `UPDATE enderecos SET padrao = 0 WHERE id_cliente = ?`;
        await pool.query(sql, [id_cliente]);
    }

    static async buscarEnderecosEntrega(id_cliente) {
        const sql = `SELECT * FROM enderecos WHERE id_cliente = ? AND tipo = 'ENTREGA'`;
        const [enderecos] = await pool.query(sql, [id_cliente]);
        return enderecos;
    }

    static async definirEnderecoComoPadrao(id_endereco, id_cliente) {
        const sql = `UPDATE enderecos SET padrao = 1 WHERE id_endereco = ? AND id_cliente = ?`;
        await pool.query(sql, [id_endereco, id_cliente]);
    }
}

module.exports = EnderecoModel;
