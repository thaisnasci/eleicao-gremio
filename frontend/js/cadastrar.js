document
  .getElementById("formCadastro")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const mensagem = document.getElementById("mensagem");
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      mensagem.style.color = "#a31616";
      mensagem.textContent = "Sessão do administrador não encontrada. Faça login novamente.";
      return;
    }

    try {
      const resposta = await fetch(`${API_URL}/api/cadastrar-matriculas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listaMatriculas:
            document.getElementById("listaMatriculas").value,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        if (resposta.status === 401) {
          sessionStorage.removeItem("adminToken");
          window.location.href = "admin.html";
          return;
        }

        throw new Error(dados.erro);
      }

      mensagem.style.color = "#18732a";
      mensagem.textContent = dados.mensagem;

      document.getElementById("listaMatriculas").value = "";
    } catch (erro) {
      mensagem.style.color = "#a31616";
      mensagem.textContent =
        erro.message || "Erro ao conectar ao servidor.";
    }
  });