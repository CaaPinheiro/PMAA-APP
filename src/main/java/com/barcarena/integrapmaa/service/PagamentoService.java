package com.barcarena.integrapmaa.service;

import com.barcarena.integrapmaa.dto.SaldoMensal;
import com.barcarena.integrapmaa.exception.RecursoNaoEncontradoException;
import com.barcarena.integrapmaa.exception.RegraNegocioException;
import com.barcarena.integrapmaa.model.Agricultor;
import com.barcarena.integrapmaa.model.Funcionario;
import com.barcarena.integrapmaa.model.Pagamento;
import com.barcarena.integrapmaa.repository.FuncionarioRepository;
import com.barcarena.integrapmaa.repository.PagamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Autorizacao do pagamento do saldo mensal (RF05 + RF07).
 * Somente administradores autorizam, e cada agricultor pode ter apenas
 * um pagamento por periodo de referencia.
 */
@Service
@RequiredArgsConstructor
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final SaldoService saldoService;
    private final AgricultorService agricultorService;

    public List<Pagamento> listarTodos() {
        return pagamentoRepository.findAllByOrderByDataPagamentoDescIdDesc();
    }

    public List<Pagamento> listarPorAgricultor(Long agricultorId) {
        return pagamentoRepository.findByAgricultorIdOrderByAnoReferenciaDescMesReferenciaDesc(agricultorId);
    }

    public Pagamento buscarPorId(Long id) {
        return pagamentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pagamento nao encontrado: " + id));
    }

    @Transactional
    public Pagamento autorizar(Long agricultorId, int mes, int ano, String loginUsuario) {
        pagamentoRepository.findByAgricultorIdAndMesReferenciaAndAnoReferencia(agricultorId, mes, ano)
                .ifPresent(p -> {
                    throw new RegraNegocioException(
                            "O pagamento deste agricultor para " + mes + "/" + ano + " ja foi autorizado.");
                });

        Funcionario responsavel = funcionarioRepository.findByLogin(loginUsuario)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionario nao encontrado"));

        if (!responsavel.isAdministrador()) {
            throw new RegraNegocioException("Apenas administradores podem autorizar pagamentos");
        }

        SaldoMensal saldo = saldoService.calcular(agricultorId, mes, ano);

        if (saldo.totalEntregas() == 0) {
            throw new RegraNegocioException(
                    "Nenhuma entrega registrada para este agricultor em " + mes + "/" + ano + ".");
        }

        Agricultor agricultor = agricultorService.buscarPorId(agricultorId);

        return pagamentoRepository.save(Pagamento.builder()
                .agricultor(agricultor)
                .autorizadoPor(responsavel)
                .mesReferencia(mes)
                .anoReferencia(ano)
                .valorTotal(saldo.valorTotal())
                .quantidadeTotalKg(saldo.quantidadeTotalKg())
                .totalEntregas(saldo.totalEntregas())
                .dataPagamento(LocalDate.now())
                .build());
    }

    /** Cancela a autorizacao, reabrindo o periodo para correcoes. */
    @Transactional
    public void cancelar(Long id) {
        pagamentoRepository.delete(buscarPorId(id));
    }
}
