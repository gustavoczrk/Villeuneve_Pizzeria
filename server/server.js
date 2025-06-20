const express = require('express');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middlewares globais

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(session({
  secret: 'segredo_super_secreto',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(helmet());
app.use('/login', rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: "Muitas tentativas. Tente novamente em 1 minuto."
}));

// Rotas
app.use(require('./routes/authRoutes'));
app.use(require('./routes/produtoRoutes'));
app.use(require('./routes/contatoRoutes'));
app.use(require('./routes/pedidos'));


// Start
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
