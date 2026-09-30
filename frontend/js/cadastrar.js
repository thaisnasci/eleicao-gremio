document
  .getElementById("formCadastro")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const mensagem = document.getElementById("mensagem");
    try {
      const resposta = await fetch(`${API_URL}/api/cadastrar-matriculas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senha: document.getElementById("senha").value,
            listaMatriculas: document.getElementById("listaMatriculas").value,
          }),
        }),
        dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro);
      mensagem.style.color = "#18732a";
      mensagem.textContent = dados.mensagem;
      document.getElementById("listaMatriculas").value = "";
    } catch (erro) {
      mensagem.style.color = "#a31616";
      mensagem.textContent = erro.message || "Erro ao conectar ao servidor.";
    }
  });
