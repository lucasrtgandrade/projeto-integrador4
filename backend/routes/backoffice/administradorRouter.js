const express = require('express');
const router = express.Router();
const AdministradorController = require('../../controllers/backoffice/AdministradorController');



router.get('/listar-colaboradores', AdministradorController.listarColaboradores);

module.exports = router;