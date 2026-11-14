package com.barcarena.integrapmaa.dto;

import java.util.List;

/** RF08 - Relatorio mensal consolidado das entregas dos agricultores. */
public record RelatorioEntregasAgricultores(
        int mes,
        int ano,
        List<SaldoMensal> agricultores,
        List<ItemSaldo> totaisPorProduto,
        int totalAgricultores,
        int totalEntregas,
        double quantidadeTotalKg,
        double valorTotalGeral
) {}
