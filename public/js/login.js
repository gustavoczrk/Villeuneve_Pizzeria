const loginForm = document.querySelector("form[action='/login']");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    const usuario = loginForm.usuario.value.trim();
    const senha = loginForm.senha.value.trim();

    if (!usuario || !senha) {
      alert("Por favor, preencha todos os campos.");
      e.preventDefault();
    }

    
  });
}
