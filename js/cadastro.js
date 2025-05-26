// ========== CADASTRO ==========
const cadastroForm = document.querySelector("form[action='/cadastro']");
if (cadastroForm) {
  cadastroForm.addEventListener("submit", (e) => {
    const nome = cadastroForm.nome.value.trim();
    const usuario = cadastroForm.usuario.value.trim();
    const email = cadastroForm.email.value.trim();
    const senha = cadastroForm.senha.value;
    const confirmar = cadastroForm.confirmar.value;

    if (!nome || !usuario || !email || !senha || !confirmar) {
      alert("Todos os campos são obrigatórios.");
      e.preventDefault();
      return;
    }

    if (senha.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres.");
      e.preventDefault();
      return;
    }

    if (senha !== confirmar) {
      alert("As senhas não coincidem.");
      e.preventDefault();
      return;
    }

    // Aqui você poderá enviar os dados ao backend futuramente
  });
}
