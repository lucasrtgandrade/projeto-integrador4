const pool = require('../config/db');

class FreteController {
    static async listarOpcoes(req, res) {
        try {
            const [linhas] = await pool.query('SELECT frete_id, nome, custo, prazo_entrega FROM fretes');

            const fretes = linhas.map(frete => ({
                frete_id: frete.frete_id,
                nome: frete.nome,
                custo: Number(frete.custo),
                prazo_entrega: frete.prazo_entrega
            }));

            res.json(fretes);
        } catch (error) {
            console.error('Erro ao listar opções de frete:', error);
            res.status(500).json({ mensagem: 'Erro ao carregar opções de frete' });
        }
    }
}

module.exports = FreteController;
