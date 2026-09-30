const form = document.getElementById("formChapa"),
  mensagem = document.getElementById("mensagem"),
  lista = document.getElementById("listaChapas");
async function carregarChapas() {
  try {
    const resposta = await fetch(`${API_URL}/api/chapas`),
      chapas = await resposta.json();
    if (!resposta.ok) throw new Error();
    lista.innerHTML = chapas.length
      ? chapas
          .map(
            (chapa) =>
              `<div class="item-chapa"><strong>${chapa.numero} — ${chapa.nome}</strong><br><small>${chapa.descricao || "Sem descrição."}</small></div>`,
          )
          .join("")
      : "<p>Nenhuma chapa cadastrada.</p>";
  } catch {
    lista.innerHTML = '<p class="mensagem">Erro ao carregar chapas.</p>';
  }
}
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const resposta = await fetch(`${API_URL}/api/cadastrar-chapa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senha: document.getElementById("senha").value,
          numero: document.getElementById("numero").value,
          nome: document.getElementById("nome").value,
          descricao: document.getElementById("descricao").value,
        }),
      }),
      dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.erro);
    mensagem.style.color = "#18732a";
    mensagem.textContent = "Chapa cadastrada com sucesso.";
    form.reset();
    carregarChapas();
  } catch (erro) {
    mensagem.style.color = "#a31616";
    mensagem.textContent = erro.message || "Erro ao cadastrar a chapa.";
  }
});
carregarChapas();
