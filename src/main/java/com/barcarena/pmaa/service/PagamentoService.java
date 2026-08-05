package com.barcarena.pmaa.service;

import com.barcarena.pmaa.exception.RecursoNaoEncontradoException;
import com.barcarena.pmaa.model.Administrador;
import com.barcarena.pmaa.model.Agricultor;
import com.barcarena.pmaa.model.EntregaAgricultor;
import com.barcarena.pmaa.model.Funcionario;
import com.barcarena.pmaa.model.Pagamento;
import com.barcarena.pmaa.repository.AgricultorRepository;
import com.barcarena.pmaa.repository.EntregaAgricultorRepository;
import com.barcarena.pmaa.repository.FuncionarioRepository;
import com.barcarena.pmaa.repository.PagamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final AgricultorRepository agricultorRepository;
    private final EntregaAgricultorRepository entregaRepository;
    private final FuncionarioRepository funcionarioRepository;

    public List<Pagamento> listarTodos() {
        return pagamentoRepository.findAllByOrderByDataPagamentoDesc();
    }

    public List<Pagamento> listarPorAgricultor(Long agricultorId) {
        return pagamentoRepository.findByAgricultorId(agricultorId);
    }

    public Pagamento buscarPorId(Long id) {
        return pagamentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pagamento nao encontrado: " + id));
    }

    @Transactional
    public Pagamento gerarPagamento(Long agricultorId, int mes, int ano, Long adminId) {
        pagamentoRepository.findByAgricultorIdAndMesReferenciaAndAnoReferencia(agricultorId, mes, ano)
                .ifPresent(p -> {
                    throw new IllegalArgumentException(
                            "Pagamento ja gerado para este agricultor neste periodo");
                });

        Agricultor agricultor = agricultorRepository.findById(agricultorId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Agricultor nao encontrado"));

        Funcionario funcionario = funcionarioRepository.findById(adminId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Administrador nao encontrado"));

        if (!(funcionario instanceof Administrador admin)) {
            throw new IllegalArgumentException("Apenas administradores podem gerar pagamentos");
        }

        List<EntregaAgricultor> entregas = entregaRepository
                .findByAgricultorIdAndMesAno(agricultorId, mes, ano);

        if (entregas.isEmpty()) {
            throw new IllegalArgumentException("Nenhuma entrega encontrada para este periodo");
        }

        double total = entregas.stream()
                .mapToDouble(EntregaAgricultor::calcularValorTotal)
                .sum();

        Pagamento pagamento = Pagamento.builder()
                .agricultor(agricultor)
                .autorizadoPor(admin)
                .mesReferencia(mes)
                .anoReferencia(ano)
                .valorTotal(total)
                .dataPagamento(LocalDate.now())
                .entregas(entregas)
                .build();

        return pagamentoRepository.save(pagamento);
    }
}
