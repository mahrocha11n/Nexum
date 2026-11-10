package com.example.backend.usuario;

import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UsuarioRepository {

    private final JdbcTemplate jdbc;

    public UsuarioRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        String sql = """
                SELECT id, nome, email, senha_hash, perfil, ativo
                FROM usuarios
                WHERE email = ?
                """;

        return jdbc.query(sql,
                (rs, linha) -> new Usuario(
                        rs.getLong("id"),
                        rs.getString("nome"),
                        rs.getString("email"),
                        rs.getString("senha_hash"),
                        rs.getString("perfil"),
                        rs.getInt("ativo") == 1),
                email)
                .stream()
                .findFirst();
    }

    public void inserir(String nome, String email, String senhaHash, String perfil) {
        String sql = """
                INSERT INTO usuarios (nome, email, senha_hash, perfil)
                VALUES (?, ?, ?, ?)
                """;

        jdbc.update(sql, nome, email, senhaHash, perfil);
    }

    public void atualizar(long id, String nome, String email) {
        jdbc.update("UPDATE usuarios SET nome = ?, email = ? WHERE id = ?", nome, email, id);
    }

    public void excluir(long id) {
        jdbc.update("DELETE FROM usuarios WHERE id = ?", id);
    }
}
