package com.barcarena.integrapmaa.controller;

import com.barcarena.integrapmaa.dto.RelatorioDistribuicaoCestas;
import com.barcarena.integrapmaa.dto.RelatorioEntregasAgricultores;
import com.barcarena.integrapmaa.dto.ResumoDashboard;
import com.barcarena.integrapmaa.service.RelatorioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/** RF08 - Geracao de relatorios. */
@RestController
@RequestMapping("/api/relatorios")
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioService service;

    @GetMapping("/entregas-agricultores")
    public RelatorioEntregasAgricultores entregasAgricultores(@RequestParam int mes,
                                                              @RequestParam int ano) {
        return service.entregasAgricultores(mes, ano);
    }

    @GetMapping("/distribuicao-cestas")
    public RelatorioDistribuicaoCestas distribuicaoCestas(@RequestParam int mes,
                                                          @RequestParam int ano) {
        return service.distribuicaoCestas(mes, ano);
    }

    @GetMapping("/resumo")
    public ResumoDashboard resumo() {
        return service.resumo();
    }
}
