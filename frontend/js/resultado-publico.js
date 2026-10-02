const resultado =
  document.getElementById("resultado");

const botaoAtualizar =
  document.getElementById("atualizar");


async function carregarResultados() {

  resultado.innerHTML =
    "<p>Carregando resultados...</p>";

  try {

    const resposta = await fetch(
      `${API_URL}/api/resultados-publicos`
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados.erro ||
        "Não foi possível carregar os resultados."
      );
    }

    if (!dados.length) {

      resultado.innerHTML = `
        <p>
          Ainda não há votos registrados.
        </p>
      `;

      return;
    }

    resultado.innerHTML = dados
      .map(item => `
        <div class="resultado-item">

          <h2>
            ${item.numero}
          </h2>

          <p>
            ${item.nome}
          </p>

          <strong>
            ${item.total} voto(s)
          </strong>

        </div>
      `)
      .join("");

  } catch (erro) {

    resultado.innerHTML = `
      <p>
        <strong>Erro:</strong>
        ${erro.message}
      </p>
    `;
  }
}


botaoAtualizar.addEventListener(
  "click",
  carregarResultados
);


carregarResultados();