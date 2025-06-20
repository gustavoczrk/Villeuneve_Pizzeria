async function carregarPerfil() {
  const container = document.getElementById("dados-usuario");
  try {
    const res = await fetch("/usuario");
    if (!res.ok) {
      container.innerHTML = "<p>Erro ao carregar perfil.</p>";
      return;
    }

    const usuario = await res.json();

    container.innerHTML = `
      <p><strong>Nome:</strong> ${usuario.nome}</p>
      <p><strong>Tipo:</strong> ${usuario.tipo === 'admin' ? 'Administrador' : 'Cliente'}</p>
      <p><strong>ID:</strong> ${usuario.id}</p>
      <p><strong>Endereço Atual:</strong> ${usuario.endereco || "Não cadastrado."}</p>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Erro ao carregar perfil.</p>";
  }
}

document.getElementById("form-endereco")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const endereco = document.getElementById("novo-endereco").value.trim();
  const msg = document.getElementById("msg-endereco");

  if (!endereco) {
    msg.innerText = "Digite um endereço válido.";
    return;
  }

  try {
    const res = await fetch('/usuario/endereco', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endereco })
    });

    const texto = await res.text();
    msg.innerText = texto;
    carregarPerfil();

  } catch (err) {
    console.error(err);
    msg.innerText = "Erro ao atualizar endereço.";
  }
});

carregarPerfil();
