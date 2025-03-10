const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { sessionMiddleware } = require('./middleware/sessionsMiddleware');
const app = express();


// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use (sessionMiddleware);



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));
app.use(express.static(path.join(__dirname, '../frontend/public')));


const indexRouter = require('./routes/index');
app.use('/', indexRouter);

const authRouter = require('./routes/backoffice/authRouter');
app.use('/backoffice/auth', authRouter);

const administradorRouter = require('./routes/backoffice/administradorRouter');
app.use('/backoffice/administrador', administradorRouter);

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});