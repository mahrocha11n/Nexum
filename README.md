# Nexum: login, cadastro e painel

Spring Boot (Java) + Oracle + HTML/CSS/JS. O servidor entrega as telas e a API no mesmo endereço.

## Estrutura

```
nexum/
├── banco/criar-banco.sql
└── backend/
    ├── pom.xml                      (dependência do BCrypt, veja abaixo)
    └── src/main/
        ├── java/com/example/backend/
        │   ├── CorsConfig.java
        │   └── usuario/ (Usuario, UsuarioRepository, UsuarioService, UsuarioController)
        └── resources/
            ├── application.properties
            └── static/              (telas: login, painel, cadastro, css e js)
```

## Como rodar

1. **Banco:** abra o Oracle (instância e PDB `FREEPDB1` abertos) e rode `banco/criar-banco.sql`.
   A parte 1 é com o usuário SYSTEM; a parte 2 é com o usuário `nexum`.
2. **pom.xml:** confira se tem a dependência abaixo.
   ```xml
   <dependency>
       <groupId>org.springframework.security</groupId>
       <artifactId>spring-security-crypto</artifactId>
   </dependency>
   ```
3. **Servidor:** na pasta `backend`, rode `.\mvnw spring-boot:run`.
4. **Telas:** abra `http://localhost:8080/login.html`.
5. **Cadastro:** copie `cadastro.html` e `css/cadastro.css` da colega para a pasta `static`
   (o `js/cadastro.js` já está aqui). No `cadastro.html`, coloque `minlength="8"` na senha,
   adicione `<p id="mensagem" class="mensagem" role="alert" hidden></p>` antes do botão de enviar
   e troque o final da página por `<script src="js/cadastro.js" defer></script>`.

## Antes de entregar

- Apagar o `TesteController.java` (rota `/teste-banco`).
- Não publicar o `application.properties` com a senha real do banco.
- A senha `Nexum2026` é só de desenvolvimento.

## Ainda não implementado (próximas etapas)

- "Esqueci minha senha" e "Lembrar de mim".
- Dados específicos de cada perfil (rotina do aluno, formação do professor, CNPJ do cursinho).
- Redirecionar cada perfil para a sua própria tela e bloquear acessos por perfil (RNF09).
- Limite de tentativas de login.
