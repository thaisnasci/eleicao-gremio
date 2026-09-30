async function carregarResultados() {
  const lista = document.getElementById("listaResultados");
  try {
    const resposta = await fetch(`${API_URL}/api/resultados`),
      dados = await resposta.json();
    if (!resposta.ok) throw new Error();
    if (!dados.length) {
      lista.innerHTML = "<p>Nenhum voto computado ainda.</p>";
      return;
    }
    const total = dados.reduce((s, item) => s + item.total, 0);
    lista.innerHTML = dados
      .map((item) => {
        const percentual = ((item.total / total) * 100).toFixed(1);
        return `<div style="text-align:left;border-top:1px solid #ccc;padding:12px 0"><strong>${item.numero} — ${item.nome}</strong><br>${item.total} voto(s) (${percentual}%)</div>`;
      })
      .join("");
  } catch {
    lista.innerHTML = '<p class="mensagem">Erro ao carregar os resultados.</p>';
  }
}
document
  .getElementById("atualizar")
  .addEventListener("click", carregarResultados);
carregarResultados();
