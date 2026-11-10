package com.example.backend.usuario;

import java.util.Optional;
import java.util.Set;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private static final Set<String> PERFIS_VALIDOS =
            Set.of("ALUNO_FREE", "ALUNO_PREMIUM", "CURSINHO", "PROFESSOR");

    private final UsuarioRepository repository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // Usado quando o e-mail não existe, para o tempo de resposta ser igual ao de um e-mail existente
    private final String hashFalso = encoder.encode("senha-que-ninguem-usa");

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public void cadastrar(String nome, String email, String senha, String perfil) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Informe seu nome.");
        }
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Informe um e-mail válido.");
        }
        if (senha == null || senha.length() < 8) {
            throw new IllegalArgumentException("A senha precisa ter pelo menos 8 caracteres.");
        }
        if (perfil == null || !PERFIS_VALIDOS.contains(perfil)) {
            throw new IllegalArgumentException("Perfil inválido.");
        }

        String emailLimpo = email.trim().toLowerCase();

        if (repository.buscarPorEmail(emailLimpo).isPresent()) {
            throw new IllegalArgumentException("Este e-mail já está cadastrado.");
        }

        String hash = encoder.encode(senha);

        try {
            repository.inserir(nome.trim(), emailLimpo, hash, perfil);
        } catch (DuplicateKeyException e) {
            throw new IllegalArgumentException("Este e-mail já está cadastrado.");
        }
    }

    public Optional<Usuario> autenticar(String email, String senha) {
        String emailLimpo = (email == null) ? "" : email.trim().toLowerCase();
        String senhaDigitada = (senha == null) ? "" : senha;

        Optional<Usuario> achado = repository.buscarPorEmail(emailLimpo);

        if (achado.isEmpty()) {
            encoder.matches(senhaDigitada, hashFalso);
            return Optional.empty();
        }

        Usuario usuario = achado.get();
        boolean senhaCorreta = encoder.matches(senhaDigitada, usuario.senhaHash());

        if (!senhaCorreta || !usuario.ativo()) {
            return Optional.empty();
        }

        return Optional.of(usuario);
    }

    public void atualizarDados(long id, String nome, String email) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Informe seu nome.");
        }
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Informe um e-mail válido.");
        }

        String emailLimpo = email.trim().toLowerCase();

        Optional<Usuario> existente = repository.buscarPorEmail(emailLimpo);
        if (existente.isPresent() && existente.get().id() != id) {
            throw new IllegalArgumentException("Este e-mail já está em uso.");
        }

        try {
            repository.atualizar(id, nome.trim(), emailLimpo);
        } catch (DuplicateKeyException e) {
            throw new IllegalArgumentException("Este e-mail já está em uso.");
        }
    }

    public void excluir(long id) {
        repository.excluir(id);
    }
}
