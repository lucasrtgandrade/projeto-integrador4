const express = require('express');
const path = require('path');
const { sessionMiddleware } = require('./middleware/sessionsMiddleware');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Ignore favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Routes
const paginaInicialRoutes = require('./routes/paginaInicialRoutes');
app.use('/', paginaInicialRoutes);

const authRouter = require('./routes/backoffice/authRouter');
app.use('/backoffice/auth', authRouter);

const administradorRouter = require('./routes/backoffice/administradorRouter');
app.use('/backoffice/administrador', administradorRouter);

const estoquistaRouter = require('./routes/backoffice/estoquistaRouter');
app.use('/backoffice/estoquista', estoquistaRouter);

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});

// Start the server
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});