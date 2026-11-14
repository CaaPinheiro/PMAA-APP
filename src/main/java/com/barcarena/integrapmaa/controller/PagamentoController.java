package com.barcarena.integrapmaa.controller;

import com.barcarena.integrapmaa.model.Pagamento;
import com.barcarena.integrapmaa.service.PagamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/** Autorizacao de pagamentos - restrito a administradores. */
@RestController
@RequestMapping("/api/pagamentos")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService service;

    public record AutorizacaoRequest(Long agricultorId, Integer mes, Integer ano) {}

    @GetMapping
    public List<Pagamento> listar(@RequestParam(required = false) Long agricultorId) {
        return agricultorId == null
                ? service.listarTodos()
                : service.listarPorAgricultor(agricultorId);
    }

    @GetMapping("/{id}")
    public Pagamento buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping("/autorizar")
    public ResponseEntity<Pagamento> autorizar(@RequestBody AutorizacaoRequest req,
                                               Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                service.autorizar(req.agricultorId(), req.mes(), req.ano(), principal.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        service.cancelar(id);
        return ResponseEntity.noContent().build();
    }
}
