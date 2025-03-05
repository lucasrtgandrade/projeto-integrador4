// backend/app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use(
    session({
        secret: '123', // para teste
        // secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // True se estiver usando HTTPS
    })
);

const indexRouter = require('./routes/index');
app.use('/', indexRouter);

const authRouter = require('./routes/backoffice/authRouter');
const administradorRouter = require('./routes/backoffice/administradorRouter');
const estoquistaRouter = require('./routes/backoffice/estoquistaRouter')
app.use('/backoffice/auth', authRouter);
app.use('/backoffice/administrador', administradorRouter);
app.use('/backoffice/estoquista', estoquistaRouter)



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});