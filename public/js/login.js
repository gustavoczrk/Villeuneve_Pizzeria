const loginForm = document.querySelector("form[action='/login']");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = loginForm.usuario.value.trim();
    const senha = loginForm.senha.value.trim();

    if (!usuario || !senha) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const resposta = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });

      const dados = await resposta.json();

      if (resposta.status === 200) {
        alert("Login realizado com sucesso!");

        // 🔥 Limpa carrinho anônimo
        localStorage.removeItem("carrinho_anonimo");

        // (Opcional) Salva dados do usuário logado no localStorage
        localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));

        setTimeout(() => {
          window.location.href = "/";
        }, 800);
      } else {
        alert("Erro: " + (dados?.erro || "Falha no login."));
      }
    } catch (erro) {
      console.error("Erro ao realizar login:", erro);
      alert("Erro inesperado. Tente novamente.");
    }
  });
}
