package com.barcarena.integrapmaa.dto;

import java.util.List;

/** RF08 - Relatorio mensal consolidado da distribuicao de cestas. */
public record RelatorioDistribuicaoCestas(
        int mes,
        int ano,
        List<DistribuicaoBeneficiario> beneficiarios,
        List<DistribuicaoBeneficiario.ItemDistribuicao> totaisPorProduto,
        int totalBeneficiarios,
        int totalEntregas,
        int totalCestas,
        double quantidadeTotalKg
) {}
