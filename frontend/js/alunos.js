async function carregarAlunos() {
  const lista = document.getElementById("listaAlunos");
  const mensagem = document.getElementById("mensagem");

  const totalAlunos =
    document.getElementById("totalAlunos");

  const totalVotaram =
    document.getElementById("totalVotaram");

  const totalNaoVotaram =
    document.getElementById("totalNaoVotaram");

  const token =
    sessionStorage.getItem("adminToken");

  if (!token) {
    window.location.href = "admin.html";
    return;
  }

  lista.innerHTML =
    "<p>Carregando estudantes...</p>";

  mensagem.textContent = "";

  try {
    const resposta = await fetch(
      `${API_URL}/api/alunos`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
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
        dados.erro ||
          "Não foi possível carregar os estudantes."
      );
    }

    const alunos = dados;

    const quantidadeVotaram =
      alunos.filter(
        (aluno) => aluno.jaVotou === true
      ).length;

    const quantidadeNaoVotaram =
      alunos.length - quantidadeVotaram;

    totalAlunos.textContent =
      alunos.length;

    totalVotaram.textContent =
      quantidadeVotaram;

    totalNaoVotaram.textContent =
      quantidadeNaoVotaram;

    if (!alunos.length) {
      lista.innerHTML =
        "<p>Nenhum estudante cadastrado.</p>";

      return;
    }

    lista.innerHTML = alunos
      .map((aluno) => {

        const status = aluno.jaVotou
          ? "Votou"
          : "Não votou";

        const classe = aluno.jaVotou
          ? "status-votou"
          : "status-nao-votou";

        return `
          <div class="aluno-item">

            <div class="dados-aluno">

              <strong>
                ${aluno.nome || "Nome não informado"}
              </strong>

              <span>
                Matrícula: ${aluno.matricula}
              </span>

            </div>

            <span
              class="status-aluno ${classe}"
            >
              ${status}
            </span>

          </div>
        `;
      })
      .join("");

  } catch (erro) {

    console.error(erro);

    lista.innerHTML = `
      <p class="mensagem">
        ${
          erro.message ||
          "Erro ao carregar estudantes."
        }
      </p>
    `;
  }
}

document
  .getElementById("atualizar")
  .addEventListener(
    "click",
    carregarAlunos
  );

carregarAlunos();