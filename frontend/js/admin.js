const formLogin = document.getElementById("formLogin");
const senha = document.getElementById("senha");
const mensagem = document.getElementById("mensagem");
const login = document.getElementById("login");
const opcoes = document.getElementById("opcoes");
const sair = document.getElementById("sair");

function mostrarPainel() {
    login.classList.add("escondido");
    opcoes.classList.remove("escondido");
}

function mostrarLogin() {
    opcoes.classList.add("escondido");
    login.classList.remove("escondido");
    senha.value = "";
}

function verificarSessao() {
    const token = sessionStorage.getItem("adminToken");

    if (token) {
        mostrarPainel();
    } else {
        mostrarLogin();
    }
}

formLogin.addEventListener("submit", async (event) => {
    event.preventDefault();

    const senhaDigitada = senha.value.trim();

    if (!senhaDigitada) {
        mensagem.textContent = "Digite a senha.";
        return;
    }

    mensagem.textContent = "Verificando...";

    try {
        const resposta = await fetch(`${API_URL}/api/admin/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                senha: senhaDigitada
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mensagem.textContent = dados.erro || "Senha incorreta.";
            senha.value = "";
            senha.focus();
            return;
        }

        sessionStorage.setItem("adminToken", dados.token);

        mensagem.textContent = "";
        mostrarPainel();

    } catch (erro) {
        console.error(erro);
        mensagem.textContent =
            "Não foi possível conectar ao servidor.";
    }
});

sair.addEventListener("click", () => {
    sessionStorage.removeItem("adminToken");
    mostrarLogin();
});

verificarSessao();