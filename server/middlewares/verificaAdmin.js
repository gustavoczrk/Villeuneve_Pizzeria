function verificaAdmin(req, res, next) {
  if (req.session.usuario && req.session.usuario.tipo === 'admin') {
    return next();
  }
  return res.status(403).send('Acesso negado.');
}

module.exports = verificaAdmin;
