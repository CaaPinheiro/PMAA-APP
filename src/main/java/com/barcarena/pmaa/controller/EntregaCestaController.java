package com.barcarena.pmaa.controller;

import com.barcarena.pmaa.model.EntregaCesta;
import com.barcarena.pmaa.service.EntregaCestaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entregas-cesta")
@RequiredArgsConstructor
public class EntregaCestaController {

    private final EntregaCestaService service;

    @GetMapping
    public List<EntregaCesta> listarTodas() {
        return service.listarTodas();
    }

    @GetMapping("/beneficiario/{beneficiarioId}")
    public List<EntregaCesta> listarPorBeneficiario(@PathVariable Long beneficiarioId) {
        return service.listarPorBeneficiario(beneficiarioId);
    }

    @GetMapping("/{id}")
    public EntregaCesta buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<EntregaCesta> registrar(@RequestBody EntregaCesta entrega) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrar(entrega));
    }
}
