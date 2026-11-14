package com.barcarena.integrapmaa.controller;

import com.barcarena.integrapmaa.model.EntregaCesta;
import com.barcarena.integrapmaa.service.EntregaCestaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/** RF04 - Entrega de cestas as entidades beneficiarias. */
@RestController
@RequestMapping("/api/entregas-cesta")
@RequiredArgsConstructor
public class EntregaCestaController {

    private final EntregaCestaService service;

    @GetMapping
    public List<EntregaCesta> listar(@RequestParam(required = false) Long beneficiarioId) {
        return beneficiarioId == null
                ? service.listarTodas()
                : service.listarPorBeneficiario(beneficiarioId);
    }

    @GetMapping("/{id}")
    public EntregaCesta buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<EntregaCesta> registrar(@RequestBody EntregaCesta entrega,
                                                  Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.registrar(entrega, principal.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
