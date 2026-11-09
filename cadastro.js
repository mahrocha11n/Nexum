// Pelo Live Server (porta 5500) fala com o servidor na 8080; senão usa o mesmo endereço da página.
const API = window.location.port === '5500'
    ? `http://${window.location.hostname}:8080/api`
    : '/api';

// A tela usa nomes curtos; o servidor e o banco usam estes
const PERFIS_SERVIDOR = {
    aluno: 'ALUNO_FREE',
    professor: 'PROFESSOR',
    cursinho: 'CURSINHO'
};

function mudarPerfil(tipoPerfil, elementoLabel) {
    const botoesPerfil = document.querySelectorAll('.btn-perfil');
    botoesPerfil.forEach(btn => {
        btn.classList.remove('active');
        const radio = btn.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
    });

    elementoLabel.classList.add('active');
    const inputRadio = elementoLabel.querySelector('input[type="radio"]');
    if (inputRadio) inputRadio.checked = true;

    const blocoAluno = document.getElementById('bloco-rotina-estudante');
    const blocoProfessor = document.getElementById('bloco-dados-professor');
    const blocoCursinho = document.getElementById('bloco-dados-cursinho');

    const inputHoras = document.getElementById('horasDisponiveis');
    const inputFormacao = document.getElementById('formacaoProfessor');
    const inputDisciplinas = document.getElementById('disciplinasProfessor');
    const inputNomeInst = document.getElementById('nomeInstituicao');

    blocoAluno.style.display = 'none';
    blocoProfessor.style.display = 'none';
    blocoCursinho.style.display = 'none';
    if (inputHoras) inputHoras.removeAttribute('required');
    if (inputFormacao) inputFormacao.removeAttribute('required');
    if (inputDisciplinas) inputDisciplinas.removeAttribute('required');
    if (inputNomeInst) inputNomeInst.removeAttribute('required');

    if (tipoPerfil === 'aluno') {
        blocoAluno.style.display = 'block';
        if (inputHoras) inputHoras.setAttribute('required', 'true');
    } else if (tipoPerfil === 'professor') {
        blocoProfessor.style.display = 'block';
        if (inputFormacao) inputFormacao.setAttribute('required', 'true');
        if (inputDisciplinas) inputDisciplinas.setAttribute('required', 'true');
    } else if (tipoPerfil === 'cursinho') {
        blocoCursinho.style.display = 'block';
        if (inputNomeInst) inputNomeInst.setAttribute('required', 'true');
    }
}

function selecionarVestibular(valorVestibular, elementoLabel) {
    const labels = document.querySelectorAll('.sub-card .btn-radio');

    labels.forEach(l => {
        l.classList.remove('active');
        const r = l.querySelector('input[type="radio"]');
        if (r) r.checked = false;

        const icone = l.querySelector('.radio-icon');
        if (icone) icone.innerText = '◯';
    });

    elementoLabel.classList.add('active');
    const inputInterno = elementoLabel.querySelector('input[type="radio"]');
    if (inputInterno) inputInterno.checked = true;

    const iconeAtivo = elementoLabel.querySelector('.radio-icon');
    if (iconeAtivo) iconeAtivo.innerText = '◉';

    const infoBox = document.getElementById('info-vestibular');
    const infoTitulo = document.getElementById('info-titulo');
    infoBox.style.display = 'block';
    infoTitulo.innerHTML = `📅 <strong>Data oficial da prova - ${valorVestibular}</strong>`;
}

// Mostra a mensagem na tela; se o HTML não tiver o <p id="mensagem">, usa alert
function mostrarMensagem(texto, sucesso) {
    const mensagem = document.getElementById('mensagem');
    if (!mensagem) {
        alert(texto);
        return;
    }
    mensagem.textContent = texto;
    mensagem.classList.toggle('sucesso', sucesso);
    mensagem.hidden = false;
}

async function salvarCadastro(event) {
    event.preventDefault();

    const perfilSelecionado = document.querySelector('input[name="perfil"]:checked');
    if (!perfilSelecionado) {
        mostrarMensagem('Selecione seu perfil para continuar.', false);
        return;
    }

    const botao = document.querySelector('.btn-salvar');
    const mensagem = document.getElementById('mensagem');
    if (mensagem) mensagem.hidden = true;
    botao.disabled = true;
    botao.textContent = 'Criando conta...';

    // O servidor guarda só estes quatro campos
    const dados = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value,
        perfil: PERFIS_SERVIDOR[perfilSelecionado.value]
    };

    try {
        const resposta = await fetch(`${API}/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        const corpo = await resposta.json();

        if (resposta.ok) {
            mostrarMensagem('Conta criada com sucesso! Redirecionando para o login...', true);
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        } else {
            mostrarMensagem(corpo.mensagem, false);
        }
    } catch (erro) {
        mostrarMensagem('Não foi possível conectar ao servidor. Tente novamente.', false);
    } finally {
        botao.disabled = false;
        botao.textContent = 'Finalizar Cadastro →';
    }
}
