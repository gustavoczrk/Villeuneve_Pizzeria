function carregarUsuario() {
  fetch('/usuario')
    .then(res => res.json())
    .then(usuario => {
      const authDiv = document.querySelector('.auth-buttons');
      const boasVindas = document.getElementById('boas-vindas');

      if (usuario) {
        boasVindas.innerHTML = `Bem-vindo, ${usuario.nome}`;
        let html = '';
        if (usuario.tipo === 'admin') {
          html += `<a href="/admin.html" class="login-button">Painel Admin</a>`;
        }
        html += `<a href="/logout" class="login-button">Sair</a>`;
        authDiv.innerHTML = html;
      } else {
        boasVindas.innerHTML = '';
        authDiv.innerHTML = `
          <a href="cadastro.html" class="login-button">Cadastro</a>
          <a href="login.html" class="login-button">Login</a>
        `;
      }
    });
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

// Executa tudo
carregarUsuario();
configurarFormularioContato();
configurarRedirecionamentoBotaoCardapio();
configurarRedirecionamentoLinkCardapio();
