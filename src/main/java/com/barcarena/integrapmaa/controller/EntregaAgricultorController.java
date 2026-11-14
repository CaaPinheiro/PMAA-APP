package com.barcarena.integrapmaa.controller;

import com.barcarena.integrapmaa.model.EntregaAgricultor;
import com.barcarena.integrapmaa.service.EntregaAgricultorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/** RF06 - Recebimento de produtos dos agricultores. */
@RestController
@RequestMapping("/api/entregas-agricultor")
@RequiredArgsConstructor
public class EntregaAgricultorController {

    private final EntregaAgricultorService service;

    @GetMapping
    public List<EntregaAgricultor> listar(@RequestParam(required = false) Long agricultorId) {
        return agricultorId == null
                ? service.listarTodas()
                : service.listarPorAgricultor(agricultorId);
    }

    @GetMapping("/{id}")
    public EntregaAgricultor buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<EntregaAgricultor> registrar(@RequestBody EntregaAgricultor entrega,
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
