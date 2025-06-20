function carregarUsuario() {
  fetch('/usuario')
    .then(res => res.json())
    .then(usuario => {
      const authDiv = document.querySelector('.auth-buttons');
      const boasVindas = document.getElementById('boas-vindas');

      if (usuario) {
        // Salva no localStorage para reutilização em outras páginas
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

        if (boasVindas) {
          boasVindas.innerHTML = `Bem-vindo, ${usuario.nome}`;
        }

        let html = '';

        if (usuario.tipo === 'admin') {
          html += `<a href="/admin.html" class="login-button">Painel Admin</a>`;
        } else {
          html += `<a href="perfil.html" class="login-button">Perfil</a>`;
        }

        html += `<a href="#" onclick="logout()" class="login-button">Sair</a>`;
        authDiv.innerHTML = html;
      } else {
        // Se não estiver logado
        localStorage.removeItem('usuarioLogado');
        if (boasVindas) boasVindas.innerHTML = '';

        authDiv.innerHTML = `
          <a href="cadastro.html" class="login-button">Cadastro</a>
          <a href="login.html" class="login-button">Login</a>
        `;
      }

      atualizarContadorCarrinho(); // Atualiza após sabermos se está logado
    });
}

function logout() {
  fetch('/logout')
    .then(() => {
      localStorage.removeItem('usuarioLogado');
      window.location.href = '/login.html';
    })
    .catch(err => console.error("Erro ao fazer logout:", err));
}

function configurarFormularioContato() {
  document.getElementById("form-contato")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const nome = form.nome.value.trim();
    const email = form.email.value.trim();
    const mensagem = form.mensagem.value.trim();
    const feedback = document.getElementById("mensagem-contato");

    if (!nome || !email || !mensagem) {
      feedback.innerText = "Preencha todos os campos.";
      return;
    }

    try {
      const res = await fetch("/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, mensagem })
      });

      const texto = await res.text();
      feedback.innerText = texto;
      form.reset();
    } catch (err) {
      console.error(err);
      feedback.innerText = "Erro ao enviar mensagem.";
    }
  });
}

function configurarRedirecionamentoBotaoCardapio() {
  document.getElementById("btn-cardapio")?.addEventListener("click", (e) => {
    e.preventDefault();
    const btn = e.target;
    btn.innerText = "Carregando cardápio...";
    setTimeout(() => {
      window.location.href = "cardapio.html";
    }, 800);
  });
}

function configurarRedirecionamentoLinkCardapio() {
  document.getElementById("link-cardapio-navbar")?.addEventListener("click", (e) => {
    e.preventDefault();
    const link = e.target;
    link.innerText = "Carregando cardápio...";
    setTimeout(() => {
      window.location.href = "cardapio.html";
    }, 800);
  });
}

function atualizarContadorCarrinho() {
  const contador = document.getElementById("contador-carrinho");

  let id = "anonimo";
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario?.id) id = usuario.id;

  const chave = `carrinho_${id}`;
  const carrinho = JSON.parse(localStorage.getItem(chave)) || [];

  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  if (contador) {
    contador.innerText = totalItens;
  }
}

// Executa tudo
carregarUsuario();
configurarFormularioContato();
configurarRedirecionamentoBotaoCardapio();
configurarRedirecionamentoLinkCardapio();
