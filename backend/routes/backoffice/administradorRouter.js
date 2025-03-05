const express = require('express');
const router = express.Router();
const AdministradorController = require('../../controllers/backoffice/AdministradorController');

router.get('/', AdministradorController.renderizarPaginaIndex);

router.get('/colaboradores', AdministradorController.listarColaboradores);

router.get('/adicionar-colaborador', AdministradorController.renderizarPaginaAdicionarColaborador);

router.get('/editar-colaborador', AdministradorController.renderizarPaginaEditarColaborador);

module.exports = router;