package com.barcarena.integrapmaa.controller;

import com.barcarena.integrapmaa.model.Beneficiario;
import com.barcarena.integrapmaa.service.BeneficiarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** RF02 - Cadastro de beneficiarios. */
@RestController
@RequestMapping("/api/beneficiarios")
@RequiredArgsConstructor
public class BeneficiarioController {

    private final BeneficiarioService service;

    @GetMapping
    public List<Beneficiario> listar() {
        return service.listarAtivos();
    }

    @GetMapping("/{id}")
    public Beneficiario buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Beneficiario> cadastrar(@Valid @RequestBody Beneficiario beneficiario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.cadastrar(beneficiario));
    }

    @PutMapping("/{id}")
    public Beneficiario editar(@PathVariable Long id, @Valid @RequestBody Beneficiario beneficiario) {
        return service.editar(id, beneficiario);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
