const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../../frontend/views'));
app.use(express.urlencoded({ extended: false }));

const administradorRouter = require('../../../backend/routes/backoffice/administradorRouter');
app.use('/backoffice/administrador', administradorRouter);

const estoquistaRoutes = require('../../../backend/routes/backoffice/estoquistaRouter');
app.use('/backoffice/estoquista', estoquistaRoutes);

test.skip('Arquivo auxiliar, sem testes diretos', () => {});

module.exports = app;
