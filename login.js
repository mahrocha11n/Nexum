// Pelo Live Server (porta 5500) fala com o servidor na 8080; senão usa o mesmo endereço da página.
const API = window.location.port === '5500'
    ? `http://${window.location.hostname}:8080/api`
    : '/api';

const form = document.getElementById('form-login');
const mensagem = document.getElementById('mensagem');
const botao = form.querySelector('button[type="submit"]');

function mostrarMensagem(texto) {
    mensagem.textContent = texto;
    mensagem.hidden = false;
}

form.addEventListener('submit', async (evento) => {
    // Impede o envio padrão (que colocaria e-mail e senha na URL)
    evento.preventDefault();

    mensagem.hidden = true;
    botao.disabled = true;
    botao.textContent = 'Entrando...';

    const dados = {
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value
    };

    try {
        const resposta = await fetch(`${API}/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        const corpo = await resposta.json();

        if (resposta.ok) {
            window.location.href = 'painel.html';
        } else {
            mostrarMensagem(corpo.mensagem);
        }
    } catch (erro) {
        mostrarMensagem('Não foi possível conectar ao servidor. Tente novamente.');
    } finally {
        botao.disabled = false;
        botao.textContent = 'Entrar na plataforma';
    }
});
