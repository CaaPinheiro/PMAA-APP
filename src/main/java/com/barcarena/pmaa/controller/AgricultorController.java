package com.barcarena.pmaa.controller;

import com.barcarena.pmaa.model.Agricultor;
import com.barcarena.pmaa.service.AgricultorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agricultores")
@RequiredArgsConstructor
public class AgricultorController {

    private final AgricultorService service;

    @GetMapping
    public List<Agricultor> listar() {
        return service.listarAtivos();
    }

    @GetMapping("/{id}")
    public Agricultor buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Agricultor> cadastrar(@Valid @RequestBody Agricultor agricultor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.cadastrar(agricultor));
    }

    @PutMapping("/{id}")
    public Agricultor editar(@PathVariable Long id, @Valid @RequestBody Agricultor agricultor) {
        return service.editar(id, agricultor);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
