package com.barcarena.integrapmaa.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * RF05 - Saldo dos produtos vendidos por um agricultor no mes:
 * discriminado por item e com o valor total final.
 */
public record SaldoMensal(
        Long agricultorId,
        String agricultorNome,
        String cpf,
        String numeroDap,
        int mes,
        int ano,
        int totalEntregas,
        List<ItemSaldo> itens,
        double quantidadeTotalKg,
        double valorTotal,
        boolean pago,
        LocalDate dataPagamento
) {}
