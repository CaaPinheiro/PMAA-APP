package com.barcarena.integrapmaa.service;

import com.barcarena.integrapmaa.dto.ItemSaldo;
import com.barcarena.integrapmaa.dto.SaldoMensal;
import com.barcarena.integrapmaa.exception.RegraNegocioException;
import com.barcarena.integrapmaa.model.Agricultor;
import com.barcarena.integrapmaa.model.EntregaAgricultor;
import com.barcarena.integrapmaa.model.ItemEntregaAgricultor;
import com.barcarena.integrapmaa.model.Pagamento;
import com.barcarena.integrapmaa.repository.EntregaAgricultorRepository;
import com.barcarena.integrapmaa.repository.PagamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * RF05 - Saldo dos produtos vendidos.
 *
 * Consolida as entregas de um agricultor no mes discriminando, por item,
 * a quantidade entregue, o preco praticado e o valor a receber, alem do
 * valor total final.
 *
 * O agrupamento considera produto E preco praticado: se o preco de um
 * produto mudou no meio do mes, cada faixa aparece em uma linha propria,
 * de modo que o comprovante reflita exatamente o que foi acordado em
 * cada entrega.
 */
@Service
@RequiredArgsConstructor
public class SaldoService {

    private final EntregaAgricultorRepository entregaRepository;
    private final PagamentoRepository pagamentoRepository;
    private final AgricultorService agricultorService;

    public SaldoMensal calcular(Long agricultorId, int mes, int ano) {
        validarPeriodo(mes, ano);
        Agricultor agricultor = agricultorService.buscarPorId(agricultorId);
        List<EntregaAgricultor> entregas =
                entregaRepository.buscarPorAgricultorNoPeriodo(agricultorId, mes, ano);
        return montar(agricultor, mes, ano, entregas);
    }

    /** Saldo de todos os agricultores que entregaram no periodo. */
    public List<SaldoMensal> calcularTodos(int mes, int ano) {
        validarPeriodo(mes, ano);

        Map<Long, List<EntregaAgricultor>> porAgricultor = new LinkedHashMap<>();
        for (EntregaAgricultor entrega : entregaRepository.buscarPorPeriodo(mes, ano)) {
            porAgricultor.computeIfAbsent(entrega.getAgricultor().getId(), k -> new ArrayList<>())
                         .add(entrega);
        }

        List<SaldoMensal> saldos = new ArrayList<>();
        porAgricultor.forEach((id, entregas) ->
                saldos.add(montar(entregas.get(0).getAgricultor(), mes, ano, entregas)));

        saldos.sort(Comparator.comparing(SaldoMensal::agricultorNome, String.CASE_INSENSITIVE_ORDER));
        return saldos;
    }

    private SaldoMensal montar(Agricultor agricultor, int mes, int ano,
                               List<EntregaAgricultor> entregas) {

        // Chave "produto|preco" preserva a ordem de aparicao dos produtos.
        Map<String, ItemSaldo> consolidado = new LinkedHashMap<>();

        for (EntregaAgricultor entrega : entregas) {
            for (ItemEntregaAgricultor item : entrega.getItens()) {
                String nomeProduto = item.getProduto() != null
                        ? item.getProduto().getNome() : "Produto removido";
                String chave = nomeProduto + "|" + item.getPrecoPraticado();

                ItemSaldo atual = consolidado.get(chave);
                double quantidade = (atual == null ? 0 : atual.quantidadeKg()) + item.getQuantidadeKg();

                consolidado.put(chave, new ItemSaldo(
                        nomeProduto,
                        arredondar(quantidade),
                        item.getPrecoPraticado(),
                        arredondar(quantidade * item.getPrecoPraticado())
                ));
            }
        }

        List<ItemSaldo> itens = new ArrayList<>(consolidado.values());
        double quantidadeTotal = itens.stream().mapToDouble(ItemSaldo::quantidadeKg).sum();
        double valorTotal = itens.stream().mapToDouble(ItemSaldo::subtotal).sum();

        Optional<Pagamento> pagamento = pagamentoRepository
                .findByAgricultorIdAndMesReferenciaAndAnoReferencia(agricultor.getId(), mes, ano);

        return new SaldoMensal(
                agricultor.getId(),
                agricultor.getNome(),
                agricultor.getCpf(),
                agricultor.getNumeroDap(),
                mes, ano,
                entregas.size(),
                itens,
                arredondar(quantidadeTotal),
                arredondar(valorTotal),
                pagamento.isPresent(),
                pagamento.map(Pagamento::getDataPagamento).orElse(null)
        );
    }

    private void validarPeriodo(int mes, int ano) {
        if (mes < 1 || mes > 12) {
            throw new RegraNegocioException("Mes invalido: " + mes);
        }
        if (ano < 2000 || ano > 2100) {
            throw new RegraNegocioException("Ano invalido: " + ano);
        }
    }

    static double arredondar(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }
}
