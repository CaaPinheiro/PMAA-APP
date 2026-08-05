package com.barcarena.pmaa.controller;

import com.barcarena.pmaa.model.EntregaAgricultor;
import com.barcarena.pmaa.service.EntregaAgricultorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entregas-agricultor")
@RequiredArgsConstructor
public class EntregaAgricultorController {

    private final EntregaAgricultorService service;

    @GetMapping
    public List<EntregaAgricultor> listarTodas() {
        return service.listarTodas();
    }

    @GetMapping("/agricultor/{agricultorId}")
    public List<EntregaAgricultor> listarPorAgricultor(@PathVariable Long agricultorId) {
        return service.listarPorAgricultor(agricultorId);
    }

    @GetMapping("/agricultor/{agricultorId}/mes/{mes}/ano/{ano}")
    public List<EntregaAgricultor> listarPorMesAno(
            @PathVariable Long agricultorId,
            @PathVariable int mes,
            @PathVariable int ano) {
        return service.listarPorAgricultorMesAno(agricultorId, mes, ano);
    }

    @GetMapping("/{id}")
    public EntregaAgricultor buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<EntregaAgricultor> registrar(@RequestBody EntregaAgricultor entrega) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrar(entrega));
    }
}
