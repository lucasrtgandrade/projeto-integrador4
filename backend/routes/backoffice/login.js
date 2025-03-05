const express = require('express');
const router = express.Router();
const EmpregadoController = require('../../controllers/backoffice/EmpregadoController');

router.get('/', function(req, res, next) {
    res.render('backoffice/login', { title: 'Login Backoffice' });
});

router.post('/', EmpregadoController.efetuarLogin);

module.exports = router;