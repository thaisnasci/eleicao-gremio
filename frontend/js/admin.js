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
    const autenticado = sessionStorage.getItem("adminAuth");

    if (autenticado === "true") {
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
        const resposta = await fetch(`${API_URL}/api/admin/validar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                senha: senhaDigitada
            })
        });

        if (!resposta.ok) {
            mensagem.textContent = "Senha incorreta.";
            senha.value = "";
            senha.focus();
            return;
        }

        sessionStorage.setItem("adminAuth", "true");

        mensagem.textContent = "";
        mostrarPainel();

    } catch (erro) {
        console.error(erro);
        mensagem.textContent =
            "Não foi possível conectar ao servidor.";
    }
});

sair.addEventListener("click", () => {
    sessionStorage.removeItem("adminAuth");
    mostrarLogin();
});

verificarSessao();