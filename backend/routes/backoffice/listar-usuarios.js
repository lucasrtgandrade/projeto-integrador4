const express = require('express');
const router = express.Router();
const EmpregadoController = require('../../controllers/backoffice/EmpregadoController');


router.get('/', EmpregadoController.listarEmpregado);

router.post('/', EmpregadoController.atualizarStatus);

router.get('/editar-usuario/:id', EmpregadoController.renderizarEditarUsuario);

router.post('/editar-usuario/:id', EmpregadoController.atualizarUsuario);

module.exports = router;
