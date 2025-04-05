const ClienteModel = require('../models/ClienteModel');
const EnderecoModel = require('../models/EnderecoModel');
const bcrypt = require('bcrypt');
const { validarCPF } = require('../middleware/cpfMiddleware');


class ClienteController {
    static async renderizarPaginaCadastroCliente(req, res) {
        res.render('cadastro-cliente');
    }

    static async cadastrarCliente(req, res) {
        const {
            email, nome_completo, cpf, senha,
            data_nascimento, genero,
            cep, logradouro, numero, complemento,
            bairro, cidade, uf
        } = req.body;

        if (!this.validarNome(nome_completo)) {
            return res.status(400).json({ erro: 'Nome inválido' })
        }

        const emailExiste = await this.verificarEmailExistente(email)
        if (emailExiste) {
            return res.status(200).json({ resultado: true, mensagem: 'E-mail já existe.' })
        }

        const cpfExiste = await this.verificarCpfExiste(cpf)
        if (cpfExiste) {
            return res.status(200).json({ resultado: true, mensagem: 'CPF já cadastrado.' })
        }

        if (!senha || senha.trim() === '') {
            return res.status(400).json({ mensagem: 'Senha é obrigatória.' });
        }

        if (!data_nascimento) {
            return res.status(400).json({ mensagem: 'Data de nascimento é obrigatória.' });
        }

        if (!genero || genero.trim() === '') {
            return res.status(400).json({ mensagem: 'Gênero é obrigatório.' });
        }

        const senhaCripto = await bcrypt.hash(senha, 10);

        try {
            const resultadoCliente = await ClienteModel.adicionarCliente({
                nome_completo,
                email,
                cpf,
                senha: senhaCripto,
                data_nascimento,
                genero,
            });

            const clienteId = resultadoCliente.insertId;

            await EnderecoModel.adicionarEnderecoFaturamento({
                id_cliente: clienteId,
                cep,
                logradouro,
                numero,
                complemento,
                bairro,
                cidade,
                uf
            });

            return res.status(200).json({ resultado: false, mensagem: 'Cliente cadastrado com sucesso!' });
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            return res.status(500).json({ mensagem: 'Erro interno ao cadastrar o cliente.' });
        }
    }

    static validarNome(nome) {
        if (!nome) return false;
        const regex = /^(?=(?:\b[a-zA-ZÀ-ÿ]{3,}\b\s*){2,})[a-zA-ZÀ-ÿ\s]+$/;
        return regex.test(nome.trim());
    }

    static async verificarEmailExistente(email) {
        try {
            const resultado = await ClienteModel.encontrarEmail(email);
            return !!resultado;
        } catch (error) {
            console.error('Erro ao verificar e-mail no banco:', error);
            return false;
        }
    }

    static async verificarCpfExiste(cpf) {
        try {
            const resultado = await ClienteModel.encontrarCpf(cpf);
            return !!resultado;
        } catch (error) {
            console.error('Erro ao verificar o cpf no banco:', error);
            return false;
        }
    }

    static async renderizarPaginaLogin(req, res) {
        res.render('login');
    }

    static async verificarEmailEmTempoReal(req, res) {
        const { email } = req.query;
        if (!email) return res.json({ existe: false });

        const existe = await ClienteModel.encontrarEmail(email);
        return res.json({ existe: !!existe, mensagem: !!existe ? 'E-mail já cadastrado.' : 'E-mail disponível.' });
    }

    static async verificarCpfEmTempoReal(req, res) {
        const { cpf } = req.query;

        if (!cpf) {
            return res.json({ existe: false, mensagem: 'CPF é obrigatório.' });
        }

        const cpfLimpo = cpf.replace(/\D/g, '');

        const cpfValido = validarCPF(cpfLimpo);
        if (!cpfValido) {
            return res.json({ existe: false, mensagem: 'CPF inválido.' });
        }

        const existe = await ClienteModel.encontrarCpf(cpfLimpo);
        return res.json({
            existe: !!existe,
            mensagem: !!existe ? 'CPF já cadastrado.' : 'CPF disponível.'
        });
    }

}

module.exports = ClienteController;