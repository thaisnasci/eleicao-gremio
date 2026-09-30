# Eleição do Grêmio Estudantil

## Desenvolvimento local

1. Em `backend`, copie `.env.example` para `.env` e configure as variáveis.
2. Execute `npm install` dentro de `backend`.
3. Inicie a API com `npm start` dentro de `backend`.
4. Abra a pasta `frontend` com um servidor estático, como Live Server, em `http://localhost:5500`.

O frontend utiliza `http://localhost:3000` como URL da API. Para publicar, altere apenas `frontend/js/config.js` para a URL do Render e defina `FRONTEND_URL` no ambiente do backend com a URL da Vercel.
