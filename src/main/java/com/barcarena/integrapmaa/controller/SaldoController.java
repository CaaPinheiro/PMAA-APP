package com.barcarena.integrapmaa.controller;

import com.barcarena.integrapmaa.dto.SaldoMensal;
import com.barcarena.integrapmaa.service.SaldoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** RF05 - Saldo dos produtos vendidos. */
@RestController
@RequestMapping("/api/saldos")
@RequiredArgsConstructor
public class SaldoController {

    private final SaldoService service;

    @GetMapping("/agricultor/{agricultorId}")
    public SaldoMensal porAgricultor(@PathVariable Long agricultorId,
                                     @RequestParam int mes,
                                     @RequestParam int ano) {
        return service.calcular(agricultorId, mes, ano);
    }

    @GetMapping
    public List<SaldoMensal> doPeriodo(@RequestParam int mes, @RequestParam int ano) {
        return service.calcularTodos(mes, ano);
    }
}
