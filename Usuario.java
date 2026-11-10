package com.example.backend.usuario;

public record Usuario(
        long id,
        String nome,
        String email,
        String senhaHash,
        String perfil,
        boolean ativo
) {}
