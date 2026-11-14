package com.barcarena.integrapmaa.controller;

import com.barcarena.integrapmaa.model.Funcionario;
import com.barcarena.integrapmaa.repository.FuncionarioRepository;
import com.barcarena.integrapmaa.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final FuncionarioRepository funcionarioRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public record LoginRequest(String login, String senha) {}
    public record TrocaSenhaRequest(String senhaAtual, String novaSenha) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Funcionario funcionario = funcionarioRepository.findByLogin(req.login()).orElse(null);

        if (funcionario == null || !passwordEncoder.matches(req.senha(), funcionario.getSenha())) {
            return ResponseEntity.status(401).body(Map.of("mensagem", "Login ou senha invalidos"));
        }
        if (!funcionario.isAtivo()) {
            return ResponseEntity.status(403).body(Map.of("mensagem",
                    "Este usuario esta desativado. Procure um administrador."));
        }

        String papel = funcionario.getPapel().name();
        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("token", jwtService.gerarToken(funcionario.getLogin(), papel, funcionario.getId()));
        resposta.put("id", funcionario.getId());
        resposta.put("nome", funcionario.getNome());
        resposta.put("cargo", funcionario.getCargo());
        resposta.put("papel", papel);
        return ResponseEntity.ok(resposta);
    }

    /** Permite que o proprio usuario troque sua senha. */
    @PostMapping("/trocar-senha")
    public ResponseEntity<?> trocarSenha(@RequestBody TrocaSenhaRequest req, Principal principal) {
        Funcionario funcionario = funcionarioRepository.findByLogin(principal.getName()).orElse(null);
        if (funcionario == null) {
            return ResponseEntity.status(401).body(Map.of("mensagem", "Sessao invalida"));
        }
        if (!passwordEncoder.matches(req.senhaAtual(), funcionario.getSenha())) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", "Senha atual incorreta"));
        }
        if (req.novaSenha() == null || req.novaSenha().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("mensagem",
                    "A nova senha deve ter no minimo 6 caracteres"));
        }
        funcionario.setSenha(passwordEncoder.encode(req.novaSenha()));
        funcionarioRepository.save(funcionario);
        return ResponseEntity.ok(Map.of("mensagem", "Senha alterada com sucesso"));
    }
}
