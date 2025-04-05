const pool = require('../config/db');

class EnderecoModel {
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'FATURAMENTO', TRUE)
        `;

        const [resultado] = await pool.query(sql, [
            id_cliente, cep, logradouro, numero, complemento,
            bairro, cidade, uf
        ]);

        return resultado;
    }
}

module.exports = EnderecoModel;
