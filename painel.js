// Se a tela abrir pelo Live Server (porta 5500), fala com o servidor na 8080.
// Se o próprio servidor entregar a tela (ou pelo link público), usa o mesmo endereço.
const API = window.location.port === '5500'
    ? `http://${window.location.hostname}:8080/api`
    : '/api';

const NOMES_PERFIL = {
    ALUNO_FREE: 'Aluno Free',
    ALUNO_PREMIUM: 'Aluno Premium',
    CURSINHO: 'Cursinho / Escola Parceira',
    PROFESSOR: 'Professor Particular / Mentor'
};

const form = document.getElementById('form-painel');
const mensagem = document.getElementById('mensagem');
const botaoSalvar = form.querySelector('.btn-salvar');
const botaoExcluir = document.getElementById('btn-excluir');

function mostrarMensagem(texto, sucesso) {
    mensagem.textContent = texto;
    mensagem.classList.toggle('sucesso', sucesso);
    mensagem.hidden = false;
}

function atualizarNome(nome) {
    document.getElementById('user-nome-topo').textContent = nome;
    document.getElementById('avatar-letra').textContent = nome.charAt(0).toUpperCase();
    document.getElementById('titulo-boas-vindas').textContent = `Olá, ${nome}!`;
}

function preencherTela(usuario) {
    atualizarNome(usuario.nome);

    const selo = document.getElementById('selo-perfil');
    selo.textContent = `Perfil: ${NOMES_PERFIL[usuario.perfil] || usuario.perfil}`;
    selo.hidden = false;

    document.getElementById('edit-nome').value = usuario.nome;
    document.getElementById('edit-email').value = usuario.email;
}

// Quem decide se a pessoa está logada é o servidor (pela sessão), nunca o navegador.
async function carregarPainelUsuario() {
    try {
        const resposta = await fetch(`${API}/me`, { credentials: 'include' });

        if (!resposta.ok) {
            window.location.href = 'index.html';
            return;
        }

        preencherTela(await resposta.json());
    } catch (erro) {
        mostrarMensagem('Não foi possível conectar ao servidor. Tente novamente.', false);
    }
}

async function salvarEdicao(evento) {
    evento.preventDefault();
    mensagem.hidden = true;
    botaoSalvar.disabled = true;

    const dados = {
        nome: document.getElementById('edit-nome').value,
        email: document.getElementById('edit-email').value
    };

    try {
        const resposta = await fetch(`${API}/me`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (resposta.status === 401) {
            window.location.href = 'index.html';
            return;
        }

        const corpo = await resposta.json();

        if (resposta.ok) {
            atualizarNome(corpo.nome);
            mostrarMensagem('Alterações salvas com sucesso!', true);
        } else {
            mostrarMensagem(corpo.mensagem, false);
        }
    } catch (erro) {
        mostrarMensagem('Não foi possível conectar ao servidor. Tente novamente.', false);
    } finally {
        botaoSalvar.disabled = false;
    }
}

async function deletarConta() {
    if (!confirm('Tem certeza que deseja excluir sua conta permanentemente?')) {
        return;
    }

    mensagem.hidden = true;
    botaoExcluir.disabled = true;

    try {
        const resposta = await fetch(`${API}/me`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (resposta.ok || resposta.status === 401) {
            window.location.href = 'index.html';
            return;
        }

        mostrarMensagem('Não foi possível excluir a conta.', false);
    } catch (erro) {
        mostrarMensagem('Não foi possível conectar ao servidor. Tente novamente.', false);
    } finally {
        botaoExcluir.disabled = false;
    }
}

async function sairDoPainel() {
    try {
        await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' });
    } finally {
        window.location.href = 'index.html';
    }
}

form.addEventListener('submit', salvarEdicao);
botaoExcluir.addEventListener('click', deletarConta);
document.getElementById('btn-sair').addEventListener('click', sairDoPainel);

carregarPainelUsuario();
