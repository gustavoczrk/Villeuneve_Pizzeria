function senhaValida(senha) {
  // Pelo menos 6 caracteres, com uma letra maiúscula, uma minúscula e um número
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return regex.test(senha);
}

const erroSenhaSpan = document.getElementById("erro-senha");
const cadastroForm = document.querySelector("form[action='/cadastro']");

if (cadastroForm) {
  cadastroForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = cadastroForm.nome.value.trim();
    const usuario = cadastroForm.usuario.value.trim();
    const email = cadastroForm.email.value.trim();
    const senha = cadastroForm.senha.value;

    if (!nome || !usuario || !email || !senha) {
      alert("Todos os campos são obrigatórios.");
      return;
    }

 if (!senhaValida(senha)) {
  erroSenhaSpan.innerText = "A senha deve ter pelo menos 6 caracteres, com letra maiúscula, minúscula e número.";
  return;
} else {
  erroSenhaSpan.innerText = "";
}

    try {
      const resposta = await fetch("/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, usuario, email, senha }),
      });

      const texto = await resposta.text();

      if (resposta.status === 200) {
        alert("Cadastro realizado com sucesso!");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 800); // atraso de 800ms

      } else {
        alert("Erro: " + texto);
      }
    } catch (erro) {
      console.error("Erro ao cadastrar:", erro);
      alert("Erro inesperado. Tente novamente mais tarde.");
    }
  });
}
