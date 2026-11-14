package com.barcarena.integrapmaa.service;

import com.barcarena.integrapmaa.dto.*;
import com.barcarena.integrapmaa.model.EntregaCesta;
import com.barcarena.integrapmaa.model.ItemEntregaCesta;
import com.barcarena.integrapmaa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

/**
 * RF08 - Geracao de relatorios mensais.
 * Produz os dados consolidados; a exportacao em PDF e a impressao sao
 * feitas pelo navegador a partir da versao formatada do relatorio.
 */
@Service
@RequiredArgsConstructor
public class RelatorioService {

    private final SaldoService saldoService;
    private final EntregaCestaRepository entregaCestaRepository;
    private final EntregaAgricultorRepository entregaAgricultorRepository;
    private final AgricultorRepository agricultorRepository;
    private final BeneficiarioRepository beneficiarioRepository;
    private final ProdutoRepository produtoRepository;

    /** Relatorio das entregas recebidas dos agricultores no mes. */
    public RelatorioEntregasAgricultores entregasAgricultores(int mes, int ano) {
        List<SaldoMensal> saldos = saldoService.calcularTodos(mes, ano);

        Map<String, double[]> acumulado = new LinkedHashMap<>(); // produto -> [qtd, valor]
        int totalEntregas = 0;

        for (SaldoMensal saldo : saldos) {
            totalEntregas += saldo.totalEntregas();
            for (ItemSaldo item : saldo.itens()) {
                double[] atual = acumulado.computeIfAbsent(item.produto(), k -> new double[2]);
                atual[0] += item.quantidadeKg();
                atual[1] += item.subtotal();
            }
        }

        List<ItemSaldo> totaisPorProduto = new ArrayList<>();
        acumulado.forEach((produto, valores) -> {
            double quantidade = SaldoService.arredondar(valores[0]);
            double valor = SaldoService.arredondar(valores[1]);
            // Preco medio ponderado do produto no periodo
            double precoMedio = quantidade > 0 ? SaldoService.arredondar(valor / quantidade) : 0;
            totaisPorProduto.add(new ItemSaldo(produto, quantidade, precoMedio, valor));
        });
        totaisPorProduto.sort(Comparator.comparing(ItemSaldo::produto, String.CASE_INSENSITIVE_ORDER));

        double quantidadeTotal = saldos.stream().mapToDouble(SaldoMensal::quantidadeTotalKg).sum();
        double valorTotal = saldos.stream().mapToDouble(SaldoMensal::valorTotal).sum();

        return new RelatorioEntregasAgricultores(
                mes, ano, saldos, totaisPorProduto,
                saldos.size(), totalEntregas,
                SaldoService.arredondar(quantidadeTotal),
                SaldoService.arredondar(valorTotal));
    }

    /** Relatorio da distribuicao de cestas as entidades no mes. */
    public RelatorioDistribuicaoCestas distribuicaoCestas(int mes, int ano) {
        List<EntregaCesta> entregas = entregaCestaRepository.buscarPorPeriodo(mes, ano);

        Map<Long, List<EntregaCesta>> porBeneficiario = new LinkedHashMap<>();
        for (EntregaCesta entrega : entregas) {
            porBeneficiario.computeIfAbsent(entrega.getBeneficiario().getId(), k -> new ArrayList<>())
                           .add(entrega);
        }

        List<DistribuicaoBeneficiario> linhas = new ArrayList<>();
        Map<String, Double> totalGeralProdutos = new LinkedHashMap<>();
        int totalCestas = 0;

        for (List<EntregaCesta> doBeneficiario : porBeneficiario.values()) {
            Map<String, Double> porProduto = new LinkedHashMap<>();
            int cestas = 0;

            for (EntregaCesta entrega : doBeneficiario) {
                cestas += entrega.getQuantidadeCestas();
                for (ItemEntregaCesta item : entrega.getItens()) {
                    String nome = item.getProduto() != null
                            ? item.getProduto().getNome() : "Produto removido";
                    porProduto.merge(nome, item.getQuantidadeKg(), Double::sum);
                    totalGeralProdutos.merge(nome, item.getQuantidadeKg(), Double::sum);
                }
            }
            totalCestas += cestas;

            List<DistribuicaoBeneficiario.ItemDistribuicao> itens = new ArrayList<>();
            porProduto.forEach((produto, quantidade) -> itens.add(
                    new DistribuicaoBeneficiario.ItemDistribuicao(
                            produto, SaldoService.arredondar(quantidade))));
            itens.sort(Comparator.comparing(
                    DistribuicaoBeneficiario.ItemDistribuicao::produto, String.CASE_INSENSITIVE_ORDER));

            double quantidadeTotal = itens.stream()
                    .mapToDouble(DistribuicaoBeneficiario.ItemDistribuicao::quantidadeKg).sum();

            var beneficiario = doBeneficiario.get(0).getBeneficiario();
            linhas.add(new DistribuicaoBeneficiario(
                    beneficiario.getId(),
                    beneficiario.getNome(),
                    beneficiario.getResponsavel(),
                    doBeneficiario.size(),
                    cestas,
                    itens,
                    SaldoService.arredondar(quantidadeTotal)));
        }

        linhas.sort(Comparator.comparing(
                DistribuicaoBeneficiario::beneficiarioNome, String.CASE_INSENSITIVE_ORDER));

        List<DistribuicaoBeneficiario.ItemDistribuicao> totaisPorProduto = new ArrayList<>();
        totalGeralProdutos.forEach((produto, quantidade) -> totaisPorProduto.add(
                new DistribuicaoBeneficiario.ItemDistribuicao(
                        produto, SaldoService.arredondar(quantidade))));
        totaisPorProduto.sort(Comparator.comparing(
                DistribuicaoBeneficiario.ItemDistribuicao::produto, String.CASE_INSENSITIVE_ORDER));

        double quantidadeTotal = totaisPorProduto.stream()
                .mapToDouble(DistribuicaoBeneficiario.ItemDistribuicao::quantidadeKg).sum();

        return new RelatorioDistribuicaoCestas(
                mes, ano, linhas, totaisPorProduto,
                linhas.size(), entregas.size(), totalCestas,
                SaldoService.arredondar(quantidadeTotal));
    }

    /** Indicadores da tela inicial. */
    public ResumoDashboard resumo() {
        LocalDate hoje = LocalDate.now();
        int mes = hoje.getMonthValue();
        int ano = hoje.getYear();

        var entregasAgr = entregaAgricultorRepository.buscarPorPeriodo(mes, ano);
        var entregasCesta = entregaCestaRepository.buscarPorPeriodo(mes, ano);

        double kgRecebido = entregasAgr.stream()
                .mapToDouble(e -> e.calcularTotalKg()).sum();
        double valorRecebido = entregasAgr.stream()
                .mapToDouble(e -> e.calcularValorTotal()).sum();
        double kgDistribuido = entregasCesta.stream()
                .mapToDouble(EntregaCesta::calcularTotalKg).sum();

        long dapsVencidas = agricultorRepository.findByAtivoTrueOrderByNome().stream()
                .filter(a -> a.isDapVencida()).count();

        return new ResumoDashboard(
                mes, ano,
                agricultorRepository.countByAtivoTrue(),
                beneficiarioRepository.countByAtivoTrue(),
                produtoRepository.countByAtivoTrue(),
                dapsVencidas,
                entregasAgr.size(),
                entregasCesta.size(),
                SaldoService.arredondar(kgRecebido),
                SaldoService.arredondar(valorRecebido),
                SaldoService.arredondar(kgDistribuido));
    }
}
