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

document
  .getElementById("atualizar")
  .addEventListener("click", carregarResultados);

carregarResultados();