package com.barcarena.integrapmaa.dto;

/** Indicadores exibidos na tela inicial. */
public record ResumoDashboard(
        int mes,
        int ano,
        long agricultoresAtivos,
        long beneficiariosAtivos,
        long produtosAtivos,
        long dapsVencidas,
        int entregasAgricultorMes,
        int entregasCestaMes,
        double quantidadeRecebidaKgMes,
        double valorRecebidoMes,
        double quantidadeDistribuidaKgMes
) {}
