package com.barcarena.integrapmaa.controller;

import com.barcarena.integrapmaa.model.Funcionario;
import com.barcarena.integrapmaa.model.enums.Papel;
import com.barcarena.integrapmaa.repository.FuncionarioRepository;
import com.barcarena.integrapmaa.service.FuncionarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/** RF07 - Controle administrativo. Restrito a administradores. */
@RestController
@RequestMapping("/api/funcionarios")
@RequiredArgsConstructor
public class FuncionarioController {

    private final FuncionarioService service;
    private final FuncionarioRepository funcionarioRepository;

    public record NovoFuncionario(String nome, String cargo, String login, String senha, Papel papel) {}
    public record EdicaoFuncionario(String nome, String cargo, Papel papel) {}
    public record NovaSenha(String senha) {}

    @GetMapping
    public List<Funcionario> listar() {
        return service.listar();
    }

    @PostMapping
    public ResponseEntity<Funcionario> conceder(@RequestBody NovoFuncionario req) {
        Funcionario criado = service.conceder(
                req.nome(), req.cargo(), req.login(), req.senha(), req.papel());
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    public Funcionario editar(@PathVariable Long id,
                              @RequestBody EdicaoFuncionario req,
                              Principal principal) {
        return service.editar(id, req.nome(), req.cargo(), req.papel(), idDoUsuario(principal));
    }

    @PutMapping("/{id}/alternar-ativo")
    public Funcionario alternarAtivo(@PathVariable Long id, Principal principal) {
        return service.alternarAtivo(id, idDoUsuario(principal));
    }

    @PutMapping("/{id}/senha")
    public ResponseEntity<Map<String, String>> redefinirSenha(@PathVariable Long id,
                                                              @RequestBody NovaSenha req) {
        service.redefinirSenha(id, req.senha());
        return ResponseEntity.ok(Map.of("mensagem", "Senha redefinida com sucesso"));
    }

    private Long idDoUsuario(Principal principal) {
        return funcionarioRepository.findByLogin(principal.getName())
                .map(Funcionario::getId).orElse(null);
    }
}
