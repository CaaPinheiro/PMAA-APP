package com.barcarena.pmaa.controller;

import com.barcarena.pmaa.model.Funcionario;
import com.barcarena.pmaa.repository.FuncionarioRepository;
import com.barcarena.pmaa.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final FuncionarioRepository funcionarioRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciais) {
        String login = credenciais.get("login");
        String senha = credenciais.get("senha");

        Funcionario funcionario = funcionarioRepository.findByLogin(login).orElse(null);

        if (funcionario == null || !passwordEncoder.matches(senha, funcionario.getSenha())) {
            return ResponseEntity.status(401).body(Map.of("mensagem", "Login ou senha invalidos"));
        }

        if (!funcionario.isAtivo()) {
            return ResponseEntity.status(403).body(Map.of("mensagem", "Usuario inativo"));
        }

        String papel = funcionario.getPapel();
        String token = jwtService.gerarToken(login, papel);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "nome", funcionario.getNome(),
                "papel", papel,
                "id", funcionario.getId()
        ));
    }
}
