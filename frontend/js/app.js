let matricula = "",
  chapas = [],
  numero = "",
  votoBranco = false;
const tela = document.getElementById("conteudoTela"),
  teclado = document.getElementById("teclado");
for (let n = 1; n <= 9; n += 1)
  teclado.insertAdjacentHTML(
    "beforeend",
    `<button class="botao tecla" data-numero="${n}">${n}</button>`,
  );
teclado.insertAdjacentHTML(
  "beforeend",
  '<button class="botao tecla zero" data-numero="0">0</button>',
);
document
  .getElementById("formMatricula")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const campo = document.getElementById("matricula"),
      mensagem = document.getElementById("mensagemMatricula");
    matricula = campo.value.trim();
    mensagem.textContent = "";
    try {
      let resposta = await fetch(`${API_URL}/api/alunos/validar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matricula }),
        }),
        dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro);
      resposta = await fetch(`${API_URL}/api/chapas`);
      chapas = await resposta.json();
      if (!resposta.ok) throw new Error("Não foi possível carregar as chapas.");
      document.getElementById("telaMatricula").classList.add("escondido");
      document.getElementById("urna").classList.remove("escondido");
      atualizarTela();
    } catch (erro) {
      mensagem.textContent = erro.message || "Erro ao conectar ao servidor.";
    }
  });
teclado.addEventListener("click", (event) => {
  const tecla = event.target.dataset.numero;
  if (tecla && numero.length < 4) {
    numero += tecla;
    votoBranco = false;
    atualizarTela();
  }
});
document.getElementById("corrige").addEventListener("click", () => {
  numero = "";
  votoBranco = false;
  atualizarTela();
});
document.getElementById("branco").addEventListener("click", () => {
  numero = "";
  votoBranco = true;
  atualizarTela();
});
document
  .getElementById("confirma")
  .addEventListener("click", confirmarPreparacao);
function atualizarTela() {
  const chapa = chapas.find((item) => item.numero === numero),
    detalhe = votoBranco
      ? "<p><strong>VOTO EM BRANCO</strong></p>"
      : chapa
        ? `<p><strong>CHAPA ${chapa.numero} — ${chapa.nome}</strong></p><p>${chapa.descricao || "Sem informações adicionais."}</p>`
        : `<p>${numero ? "Chapa não encontrada." : "Digite o número da chapa."}</p>`;
  tela.innerHTML = `<p class="instrucao">SEU VOTO PARA</p><h2>GRÊMIO ESTUDANTIL</h2><p class="instrucao">NÚMERO:</p><div class="numero">${votoBranco ? "BRANCO" : numero || "_"}</div><div id="dadosChapa">${detalhe}</div>`;
}
function confirmarPreparacao() {
  const chapa = chapas.find((item) => item.numero === numero);
  if (!votoBranco && !chapa) {
    atualizarTela();
    return;
  }
  const texto = votoBranco
    ? "VOTO EM BRANCO"
    : `CHAPA ${chapa.numero} — ${chapa.nome}`;
  tela.innerHTML = `<div class="confirmacao"><p class="instrucao">CONFIRA SEU VOTO</p><h2>${texto}</h2><p>Deseja confirmar?</p><button id="sim" class="botao confirma">SIM, CONFIRMAR</button><button id="nao" class="botao corrige">NÃO</button></div>`;
  document.getElementById("sim").addEventListener("click", enviarVoto);
  document.getElementById("nao").addEventListener("click", atualizarTela);
}
async function enviarVoto() {
  try {
    const resposta = await fetch(`${API_URL}/api/votos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matricula,
        numeroChapa: numero,
        tipo: votoBranco ? "branco" : "chapa",
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro);
    }

    tela.innerHTML =
      '<div class="sucesso"><h2>VOTO CONFIRMADO!</h2><p>Obrigado por participar da eleição.</p><p>Aguarde o próximo estudante.</p></div>';

    document.querySelector(".painel").classList.add("escondido");

    setTimeout(() => {
      window.location.reload();
    }, 2000);

  } catch (erro) {
    tela.innerHTML = `
      <p><strong>Não foi possível confirmar:</strong></p>
      <p>${erro.message}</p>
    `;

    setTimeout(atualizarTela, 2500);
  }
}
