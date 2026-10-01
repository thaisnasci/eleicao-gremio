async function carregarResultados() {
  const lista = document.getElementById("listaResultados");
  const token = sessionStorage.getItem("adminToken");

  if (!token) {
    window.location.href = "admin.html";
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/api/resultados`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const dados = await resposta.json();

    if (resposta.status === 401) {
      sessionStorage.removeItem("adminToken");
      window.location.href = "admin.html";
      return;
    }

    if (!resposta.ok) {
      throw new Error(
        dados.erro || "Erro ao carregar os resultados."
      );
    }

    if (!dados.length) {
      lista.innerHTML = "<p>Nenhum voto computado ainda.</p>";
      return;
    }

    const total = dados.reduce(
      (soma, item) => soma + item.total,
      0
    );

    lista.innerHTML = dados
      .map((item) => {
        const percentual = (
          (item.total / total) *
          100
        ).toFixed(1);

        return `
          <div style="text-align:left;border-top:1px solid #ccc;padding:12px 0">
            <strong>${item.numero} — ${item.nome}</strong>
            <br>
            ${item.total} voto(s) (${percentual}%)
          </div>
        `;
      })
      .join("");

  } catch (erro) {
    lista.innerHTML = `
      <p class="mensagem">
        ${erro.message || "Erro ao carregar os resultados."}
      </p>
    `;
  }
}


async function limparBanco() {
  const mensagem = document.getElementById("mensagemLimpeza");
  const token = sessionStorage.getItem("adminToken");

  if (!token) {
    window.location.href = "admin.html";
    return;
  }

  const confirmar = confirm(
    "ATENÇÃO!\n\n" +
    "Isso irá apagar TODOS os alunos, TODAS as chapas e TODOS os votos.\n\n" +
    "Essa ação não pode ser desfeita.\n\n" +
    "Deseja continuar?"
  );

  if (!confirmar) {
    return;
  }

  const senhaReset = prompt(
    "Digite a senha exclusiva para limpar o banco de dados:"
  );

  if (!senhaReset) {
    mensagem.style.color = "#a31616";
    mensagem.textContent = "Limpeza cancelada.";
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/api/admin/limpar-tudo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        senhaReset,
      }),
    });

    const dados = await resposta.json();

    if (resposta.status === 401) {
      if (dados.erro === "Administrador não autenticado.") {
        sessionStorage.removeItem("adminToken");
        window.location.href = "admin.html";
        return;
      }

      mensagem.style.color = "#a31616";
      mensagem.textContent =
        dados.erro || "Senha de limpeza inválida.";
      return;
    }

    if (!resposta.ok) {
      throw new Error(
        dados.erro || "Não foi possível limpar o banco."
      );
    }

    mensagem.style.color = "#18732a";
    mensagem.textContent = dados.mensagem;

    await carregarResultados();

  } catch (erro) {
    mensagem.style.color = "#a31616";
    mensagem.textContent =
      erro.message || "Erro ao limpar o banco de dados.";
  }
}


document
  .getElementById("atualizar")
  .addEventListener("click", carregarResultados);

document
  .getElementById("limparBanco")
  .addEventListener("click", limparBanco);


carregarResultados();