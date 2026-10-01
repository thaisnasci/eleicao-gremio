document
  .getElementById("formCadastro")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const mensagem = document.getElementById("mensagem");
    const texto = document.getElementById("listaAlunos").value;
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      mensagem.style.color = "#a31616";
      mensagem.textContent =
        "Sessão do administrador não encontrada. Faça login novamente.";
      return;
    }

    const linhas = texto
      .split("\n")
      .map((linha) => linha.trim())
      .filter((linha) => linha !== "");

    const alunos = [];

    for (const linha of linhas) {
      const partes = linha.split(",");

      if (partes.length < 2) {
        mensagem.style.color = "#a31616";
        mensagem.textContent =
          `Formato inválido na linha: "${linha}". Use: matrícula, nome`;
        return;
      }

      const matricula = partes[0].trim();
      const nome = partes.slice(1).join(",").trim();

      if (!matricula || !nome) {
        mensagem.style.color = "#a31616";
        mensagem.textContent =
          `Matrícula ou nome inválido na linha: "${linha}".`;
        return;
      }

      alunos.push({
        matricula,
        nome
      });
    }

    if (!alunos.length) {
      mensagem.style.color = "#a31616";
      mensagem.textContent =
        "Informe pelo menos um estudante.";
      return;
    }

    mensagem.style.color = "#333";
    mensagem.textContent = "Cadastrando estudantes...";

    try {
      const resposta = await fetch(
        `${API_URL}/api/cadastrar-matriculas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            alunos
          })
        }
      );

      const dados = await resposta.json();

      if (resposta.status === 401) {
        sessionStorage.removeItem("adminToken");
        window.location.href = "admin.html";
        return;
      }

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Erro ao cadastrar estudantes."
        );
      }

      mensagem.style.color = "#18732a";
      mensagem.textContent = dados.mensagem;

      document.getElementById("listaAlunos").value = "";

    } catch (erro) {
      console.error(erro);

      mensagem.style.color = "#a31616";
      mensagem.textContent =
        erro.message ||
        "Erro ao conectar ao servidor.";
    }
  });