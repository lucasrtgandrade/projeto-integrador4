const ClienteModel = require('../models/ClienteModel');
const EnderecoModel = require('../models/EnderecoModel');
const bcrypt = require('bcrypt');
const { validarCPF } = require('../middleware/cpfMiddleware');
const ProdutoModel = require("../models/backoffice/ProdutoModel");
const PedidoModel = require('../models/PedidoModel');
const CarrinhoModel = require('../models/CarrinhoModel');


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

    static async logar(req, res) {
        const { email, senha } = req.body;

        try {
            const cliente = await ClienteModel.encontrarEmail(email);

            if (!cliente) {
                return res.status(400).json({ mensagem: 'E-mail não encontrado.' });
            }

            const senhaCorreta = await bcrypt.compare(senha, cliente.senha);

            if (!senhaCorreta) {
                return res.status(401).json({ mensagem: 'Senha incorreta.' });
            }

            req.session.user = {
                id: cliente.id_cliente,
                nome: cliente.nome_completo,
                email: cliente.email
            };

            return res.status(200).json({ mensagem: 'Login realizado com sucesso!' });

        } catch (error) {
            console.error('Erro ao realizar login:', error);
            return res.status(500).json({ mensagem: 'Erro interno ao tentar fazer login.' });
        }
    }

    static async renderizarHome(req, res) {
        try {
            if (!req.session.user) {
                return res.redirect('/clientes/login');
            }

            const { produtos } = await ProdutoModel.listarProdutosParaHome(1, 10)

            const id_cliente = req.session.user.id;
            const [cliente] = await ClienteModel.encontrarCliente(id_cliente);

            if (!cliente) {
                return res.status(404).send('Cliente não encontrado');
            }

            res.render('cliente-home', {
                nomeCliente: req.session.user.nome,
                produtos: produtos,
                usuario: req.session.user,
                cliente
            });
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            res.status(500).send('Erro ao carregar a página inicial');
        }
    }

    static logout(req, res) {
        req.session.destroy(err => {
            if (err) {
                console.error('Erro ao encerrar a sessão:', err);
                return res.status(500).send('Erro ao encerrar a sessão.');
            }

            res.redirect('/clientes/login');
        });
    }

    static async renderizarPaginaEditar(req, res) {
        try {
            if (!req.session.user) {
                return res.redirect('/clientes/login');
            }

            const id_cliente = req.session.user.id;

            const [cliente] = await ClienteModel.encontrarCliente(id_cliente);

            if (!cliente) {
                return res.status(404).send('Cliente não encontrado');
            }

            if (cliente?.data_nascimento) {
                const data = new Date(cliente.data_nascimento);
                const dia = String(data.getDate()).padStart(2, '0');
                const mes = String(data.getMonth() + 1).padStart(2, '0');
                const ano = data.getFullYear();
                cliente.data_nascimento_formatada = `${dia}/${mes}/${ano}`;
            }

            res.render('editar-perfil', {
                usuario: req.session.user,
                cliente
            });

        } catch (error) {
            console.error('Erro ao buscar informações:', error);
            res.status(500).send('Erro ao carregar endereços.');
        }
    }

    static async atualizarCliente(req, res) {
        const clienteId = req.session?.user?.id;

        if (!clienteId) {
            return res.status(401).json({ mensagem: 'Você precisa estar logado para atualizar seus dados.' });
        }

        const { nome_completo, data_nascimento, genero, senha } = req.body;

        const dadosParaAtualizar = {};

        if (nome_completo) {
            dadosParaAtualizar.nome_completo = nome_completo;
        }

        if (data_nascimento) {
            dadosParaAtualizar.data_nascimento = data_nascimento;
        }

        if (genero) {
            dadosParaAtualizar.genero = genero;
        }

        if (senha) {
            try {
                const senhaCriptografada = await bcrypt.hash(senha, 10);
                dadosParaAtualizar.senha = senhaCriptografada;
            } catch (error) {
                console.error('Erro ao criptografar senha:', error);
                return res.status(500).json({ mensagem: 'Erro ao processar a senha.' });
            }
        }

        if (Object.keys(dadosParaAtualizar).length === 0) {
            return res.status(400).json({ mensagem: 'Preencha pelo menos um campo para atualizar.' });
        }

        try {
            await ClienteModel.atualizarCliente(clienteId, dadosParaAtualizar);
            return res.status(200).json({ mensagem: 'Dados atualizados com sucesso!' });
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            return res.status(500).json({ mensagem: 'Erro ao atualizar os dados do cliente.' });
        }
    }

    static renderizarPaginaAdicionarEndereco(req, res) {
        const cliente = req.cliente;
        res.render('adicionar-endereco', { cliente });
    }

    static async adicionarEnderecoEntrega(req, res) {
        const id_cliente = req.session?.user?.id;

        if (!id_cliente) {
            return res.status(401).json({ mensagem: 'Você precisa estar logado para adicionar um endereço.' });
        }

        const {
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            uf,
            padrao
        } = req.body;

        try {
            // Se o cliente marcou como padrão, removemos o status de padrão dos outros endereços
            if (padrao === 1 || padrao === '1') {
                await EnderecoModel.removerEnderecoPadrao(id_cliente);
            }

            const cepLimpo = req.body.cep.replace(/\D/g, '');

            await EnderecoModel.adicionarEnderecoEntrega({
                id_cliente,
                cep: cepLimpo,
                logradouro,
                numero,
                complemento,
                bairro,
                cidade,
                uf,
                padrao: padrao === 1 || padrao === '1' ? 1 : 0
            });

            return res.status(200).json({ mensagem: 'Endereço adicionado com sucesso!' });
        } catch (error) {
            console.error('Erro ao adicionar endereço:', error);
            return res.status(500).json({ mensagem: 'Erro ao adicionar endereço.' });
        }
    }

    static async listarEnderecosEntrega(req, res) {
        const id_cliente = req.session?.user?.id;

        if (!id_cliente) {
            return res.redirect('/clientes/login');
        }

        try {
            const enderecos = await EnderecoModel.buscarEnderecosEntrega(id_cliente);
            res.render('listar-enderecos', { enderecos });
        } catch (error) {
            console.error('Erro ao listar endereços:', error);
            res.status(500).send('Erro ao carregar endereços.');
        }
    }

    static async definirEnderecoPadrao(req, res) {
        const id_cliente = req.session?.user?.id;
        const { id } = req.params;

        if (!id_cliente) {
            return res.status(401).json({ mensagem: 'Login necessário.' });
        }

        try {
            await EnderecoModel.removerEnderecoPadrao(id_cliente);
            await EnderecoModel.definirEnderecoComoPadrao(id, id_cliente);
            return res.status(200).json({ mensagem: 'Endereço definido como padrão!' });
        } catch (error) {
            console.error('Erro ao definir endereço padrão:', error);
            res.status(500).json({ mensagem: 'Erro interno.' });
        }
    }

    static async renderizarPaginaCheckoutEndereco(req, res) {
        const id_cliente = req.session?.user?.id;

        try {
            const enderecos = await EnderecoModel.buscarEnderecosEntrega(id_cliente);

            const pedido = await PedidoModel.buscarPedidoMaisRecentePorCliente(id_cliente);
            const carrinho = await CarrinhoModel.buscarCarrinhoMaisRecentePorCliente(id_cliente);

            res.render('checkout-endereco-entrega', {
                enderecos,
                idPedido: pedido?.id_pedido || null,
                idCarrinho: carrinho?.id_carrinho || null,
                idCliente: id_cliente
            });
        } catch (error) {
            console.error('Erro ao carregar a página de checkout (endereços):', error);
            res.status(500).send('Erro ao carregar endereços.');
        }
    }

    static async testeCheckoutMiddleware(req, res) {
        res.render('teste', {
            checkout: req.session.checkout
        });
    }
}

module.exports = ClienteController;