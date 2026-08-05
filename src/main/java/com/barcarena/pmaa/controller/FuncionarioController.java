package com.barcarena.pmaa.controller;

import com.barcarena.pmaa.model.Funcionario;
import com.barcarena.pmaa.service.FuncionarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/funcionarios")
@RequiredArgsConstructor
public class FuncionarioController {

    private final FuncionarioService service;

    public record FuncionarioRequest(String nome, String cargo, String login, String senha, boolean admin) {}

    @GetMapping
    public List<Funcionario> listar() {
        return service.listar();
    }

    @PostMapping
    public ResponseEntity<Funcionario> cadastrar(@RequestBody FuncionarioRequest req) {
        Funcionario criado = service.cadastrar(req.nome(), req.cargo(), req.login(), req.senha(), req.admin());
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}/alternar-ativo")
    public Funcionario alternarAtivo(@PathVariable Long id) {
        return service.alternarAtivo(id);
    }
}
