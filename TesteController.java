package com.example.backend;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TesteController {

    private final JdbcTemplate jdbc;

    public TesteController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/teste-banco")
    public String testarBanco() {
        return jdbc.queryForObject("SELECT USER FROM DUAL", String.class);
    }
}