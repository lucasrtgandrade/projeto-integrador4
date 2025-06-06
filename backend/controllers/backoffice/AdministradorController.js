const ColaboradorModel = require('../../models/backoffice/ColaboradorModel')
const { compareSenha } = require('../../utils/auth')
const validarCPFMiddleware = require('../../middleware/cpfMiddleware');
const validarSenhaMiddleware = require('../../middleware/senhaMiddleware');

class AdministradorController {
    static renderizarPaginaIndex(req, res) {
        const colaboradorLogado = req.session.user ? req.session.user.email : 'Visitante';
        res.render('backoffice/administrador/', {
            title: 'Administrador',
            colaborador: colaboradorLogado,
            cargo_id: req.session.user ? req.session.user.cargo_id : null
        });
    }

    static async listarColaboradores(req, res) {
        try {
            const colaboradores = await ColaboradorModel.listarColaboradores();
            res.render('backoffice/administrador/listar-colaboradores', {
                colaboradores: colaboradores,
            });
        } catch (error) {
            console.error('Erro ao listar colaboradores:', error);
            res.status(500).json({ success: false, message: 'Erro ao listar colaboradores' });
        }
    }

    static async alterarStatusColaborador(req, res) {
        const { colaborador_id } = req.params;

        try {
            const novoStatus = await ColaboradorModel.alterarStatusColaborador(colaborador_id);

            const mensagem = novoStatus === 1 ? 'Colaborador ativado com sucesso!' : 'Colaborador desativado com sucesso!';
            res.json({ success: true, mensagem, novoStatus }); // Use "novoStatus" consistently
        } catch (error) {
            console.error('Erro ao alternar status do colaborador:', error);
            res.status(500).json({ success: false, message: error.message || 'Erro ao alternar status do colaborador' });
        }
    }

    static async renderizarPaginaAlterarColaborador(req, res) {
        const { colaborador_id } = req.params;

        try {
            const colaborador = await ColaboradorModel.encontrarPorId(colaborador_id);

            if (!colaborador) {
                return res.status(404).send('Colaborador não encontrado');
            }

            res.render('backoffice/administrador/alterar-colaborador', { colaborador, req });
        } catch (error) {
            console.error('Erro ao carregar página de alteração:', error);
            res.status(500).send('Erro ao carregar página de alteração');
        }
    }

    static async alterarColaborador(req, res) {
        const { colaborador_id } = req.params;
        const { nome, cpf, senha, confirmarSenha, cargo_id } = req.body;

        try {
            // Verificar se as senhas coincidem
            if (senha && senha !== confirmarSenha) {
                return res.status(400).json({ success: false, message: 'As senhas não coincidem.' });
            }

            // Atualizar os dados do colaborador
            await ColaboradorModel.alterarDadosColaborador(colaborador_id, nome, cpf, senha, cargo_id);

            res.json({ success: true, message: 'Colaborador atualizado com sucesso!' });
        } catch (error) {
            console.error('Erro ao alterar colaborador:', error);
            res.status(500).json({ success: false, message: error.message || 'Erro ao alterar colaborador' });
        }
    }

    static async renderizarPaginaCadastrarColaborador(req, res) {
        res.render('backoffice/administrador/cadastrar-colaborador', { req });
    }

    static async cadastrarColaborador(req, res) {
        const { nome, cpf, email, senha, confirmarSenha, cargo_id } = req.body;

        try {
            // Verificar se as senhas coincidem
            if (senha !== confirmarSenha) {
                return res.status(400).json({ success: false, message: 'As senhas não coincidem.' });
            }

            // Verificar se o email já está cadastrado
            const colaboradorExistente = await ColaboradorModel.encontrarEmail(email);
            if (colaboradorExistente) {
                return res.status(400).json({ success: false, message: 'Este email já está cadastrado.' });
            }

            // Cadastrar o colaborador (status sempre ativo)
            await ColaboradorModel.cadastrarColaborador({
                nome,
                cpf,
                email,
                senha,
                status: 1, // Sempre ativo
                cargo_id
            });

            res.json({ success: true, message: 'Colaborador cadastrado com sucesso!' });
        } catch (error) {
            console.error('Erro ao cadastrar colaborador:', error);
            res.status(500).json({ success: false, message: error.message || 'Erro ao cadastrar colaborador' });
        }
    }

    static async renderizarPaginaListarProdutos(req, res) {
        try {
            res.render('backoffice/administrador/listar-produtos', {
                title: 'Lista de Produtos',
                colaborador: req.session.user?.email || 'Visitante',
                cargo_id: req.session.user?.cargo_id || null
            });
        } catch (error) {
            console.error('Erro ao renderizar página de produtos:', error);
            res.status(500).send('Erro ao carregar a página de produtos');
        }
    }

    static async listarProdutosAPI(req, res) {
        const { page = 1, limit = 10, search = '' } = req.query;

        try {
            const resultado = await ProdutoModel.listarProdutos(page, limit, search);

            res.json({
                success: true,
                produtos: resultado.produtos,
                paginaAtual: resultado.page,
                totalPaginas: resultado.totalPages,
                total: resultado.total
            });
        } catch (error) {
            console.error('Erro ao listar produtos via API:', error);
            res.status(500).json({ success: false, message: 'Erro ao listar produtos' });
        }
    }

    static async logout (req, res) {
        req.session.destroy( err => {
            if (err) {
                console.error('Erro ao encerrar a sessão', err);
                return res.status(500).send('Erro ao encerrar a sessão')
            }

            res.redirect('/backoffice/auth');
        });
    }
}

module.exports = AdministradorController;