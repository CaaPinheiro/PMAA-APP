package com.barcarena.pmaa.controller;

import com.barcarena.pmaa.model.Pagamento;
import com.barcarena.pmaa.service.PagamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pagamentos")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService service;

    @GetMapping
    public List<Pagamento> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/agricultor/{agricultorId}")
    public List<Pagamento> listarPorAgricultor(@PathVariable Long agricultorId) {
        return service.listarPorAgricultor(agricultorId);
    }

    @GetMapping("/{id}")
    public Pagamento buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping("/gerar")
    public ResponseEntity<Pagamento> gerarPagamento(@RequestBody Map<String, Object> dados) {
        Long agricultorId = Long.valueOf(dados.get("agricultorId").toString());
        int mes = Integer.parseInt(dados.get("mes").toString());
        int ano = Integer.parseInt(dados.get("ano").toString());
        Long adminId = Long.valueOf(dados.get("adminId").toString());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.gerarPagamento(agricultorId, mes, ano, adminId));
    }
}
