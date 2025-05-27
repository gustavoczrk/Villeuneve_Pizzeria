const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');


const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'segredo_super_secreto',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // usar true apenas com HTTPS
}));


// Conexão com MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Coxinha123*',
  database: 'villeuneve'
});

db.connect(err => {
  if (err) throw err;
  console.log('Conectado ao banco de dados MySQL!');
});

function verificaAdmin(req, res, next) {
  if (req.session.usuario && req.session.usuario.tipo === 'admin') {
    return next();
  }
  return res.status(403).send('Acesso negado.');
}

//criando rota protegida
app.get('/painel-admin', verificaAdmin, (req, res) => {
  res.send(`<h1>Bem-vindo, ${req.session.usuario.nome}</h1><p>Você está no painel de administração.</p>`);
});

//ROTA DE LOGOUT
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});


// ================== ROTA DE CADASTRO ==================
app.post('/cadastro', async (req, res) => {
  const { nome, usuario, email, senha } = req.body;

  if (!nome || !usuario || !email || !senha) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const sql = 'INSERT INTO usuarios (nome, usuario, email, senha, tipo) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nome, usuario, email, senhaHash, 'user'], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro ao cadastrar usuário.');
      }
      res.send('Usuário cadastrado com sucesso!');
    });
  } catch (erro) {
    res.status(500).send('Erro ao processar a senha.');
  }
});

// ================== ROTA DE LOGIN ==================
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE usuario = ?';
  db.query(sql, [usuario], async (err, results) => {
    if (err) return res.status(500).send('Erro no servidor.');
    if (results.length === 0) return res.status(401).send('Usuário não encontrado.');

    const user = results[0];
    const senhaCorreta = await bcrypt.compare(senha, user.senha);

    if (!senhaCorreta) return res.status(401).send('Senha incorreta.');

    // Armazena os dados do usuário na sessão
    req.session.usuario = {
      id: user.id,
      nome: user.nome,
      tipo: user.tipo
    };

    if (user.tipo === 'admin') {
      return res.redirect('/admin.html');
    } else {
      return res.redirect('/index.html');
    }
  });
});


// ================== INICIAR SERVIDOR ==================
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
