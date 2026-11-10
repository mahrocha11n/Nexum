package com.example.backend.usuario;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    public record CadastroRequest(String nome, String email, String senha, String perfil) {}
    public record LoginRequest(String email, String senha) {}
    public record AtualizarRequest(String nome, String email) {}

    @PostMapping("/cadastro")
    public ResponseEntity<Map<String, String>> cadastrar(@RequestBody CadastroRequest req) {
        try {
            service.cadastrar(req.nome(), req.email(), req.senha(), req.perfil());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensagem", "Conta criada com sucesso."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest req,
                                                     HttpServletRequest request) {
        Optional<Usuario> usuario = service.autenticar(req.email(), req.senha());

        if (usuario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensagem", "E-mail ou senha incorretos."));
        }

        Usuario u = usuario.get();

        // Sessão nova a cada login (evita session fixation)
        HttpSession antiga = request.getSession(false);
        if (antiga != null) {
            antiga.invalidate();
        }
        HttpSession sessao = request.getSession(true);
        sessao.setAttribute("usuarioId", u.id());
        sessao.setAttribute("nome", u.nome());
        sessao.setAttribute("email", u.email());
        sessao.setAttribute("perfil", u.perfil());

        return ResponseEntity.ok(Map.of("nome", u.nome(), "perfil", u.perfil()));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> me(HttpServletRequest request) {
        HttpSession sessao = request.getSession(false);

        if (sessao == null || sessao.getAttribute("usuarioId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensagem", "Você precisa entrar."));
        }

        return ResponseEntity.ok(Map.of(
                "nome", (String) sessao.getAttribute("nome"),
                "email", (String) sessao.getAttribute("email"),
                "perfil", (String) sessao.getAttribute("perfil")));
    }

    // O id vem sempre da sessão, nunca do que a tela envia
    private Long idDaSessao(HttpServletRequest request) {
        HttpSession sessao = request.getSession(false);
        return (sessao == null) ? null : (Long) sessao.getAttribute("usuarioId");
    }

    @PutMapping("/me")
    public ResponseEntity<Map<String, String>> atualizar(@RequestBody AtualizarRequest req,
                                                         HttpServletRequest request) {
        Long id = idDaSessao(request);
        if (id == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensagem", "Você precisa entrar."));
        }

        try {
            service.atualizarDados(id, req.nome(), req.email());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        }

        String nome = req.nome().trim();
        String email = req.email().trim().toLowerCase();
        HttpSession sessao = request.getSession(false);
        sessao.setAttribute("nome", nome);
        sessao.setAttribute("email", email);

        return ResponseEntity.ok(Map.of("nome", nome, "email", email));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> excluir(HttpServletRequest request) {
        Long id = idDaSessao(request);
        if (id == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        service.excluir(id);
        request.getSession(false).invalidate();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession sessao = request.getSession(false);
        if (sessao != null) {
            sessao.invalidate();
        }
        return ResponseEntity.noContent().build();
    }
}
