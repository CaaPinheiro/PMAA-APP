package com.barcarena.integrapmaa.dto;

import java.util.List;

/** RF08 - Distribuicao mensal recebida por uma entidade beneficiaria. */
public record DistribuicaoBeneficiario(
        Long beneficiarioId,
        String beneficiarioNome,
        String responsavel,
        int totalEntregas,
        int totalCestas,
        List<ItemDistribuicao> itens,
        double quantidadeTotalKg
) {
    /** Linha da distribuicao: produto e quantidade, sem valores financeiros. */
    public record ItemDistribuicao(String produto, double quantidadeKg) {}
}
