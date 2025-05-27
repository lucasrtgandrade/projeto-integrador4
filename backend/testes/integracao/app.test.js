const express = require('express');
const app = express();
const path = require('path');

// Mock de middlewares de sessão e autenticação
jest.mock('../../middleware/sessionsMiddleware', () => ({
    exigirLogin: (req, res, next) => next(),
    exigirEstoquista: (req, res, next) => next()
}));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../../frontend/views'));
app.use(express.urlencoded({ extended: false }));

const estoquistaRoutes = require('../../../backend/routes/backoffice/estoquistaRouter');
app.use('/backoffice/estoquista', estoquistaRoutes);

test.skip('Arquivo auxiliar, sem testes diretos', () => {});

module.exports = app;
