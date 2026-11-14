package com.barcarena.integrapmaa.dto;

/**
 * RF05 - Linha do saldo mensal: quantidade entregue de um produto,
 * o preco praticado e o valor a receber por esse item.
 */
public record ItemSaldo(
        String produto,
        double quantidadeKg,
        double precoUnitario,
        double subtotal
) {}
