package com.barcarena.pmaa.service;

import com.barcarena.pmaa.exception.RecursoNaoEncontradoException;
import com.barcarena.pmaa.model.Beneficiario;
import com.barcarena.pmaa.model.EntregaCesta;
import com.barcarena.pmaa.model.Funcionario;
import com.barcarena.pmaa.model.Produto;
import com.barcarena.pmaa.repository.BeneficiarioRepository;
import com.barcarena.pmaa.repository.EntregaCestaRepository;
import com.barcarena.pmaa.repository.FuncionarioRepository;
import com.barcarena.pmaa.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EntregaCestaService {

    private final EntregaCestaRepository entregaRepository;
    private final BeneficiarioRepository beneficiarioRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ProdutoRepository produtoRepository;

    public List<EntregaCesta> listarTodas() {
        return entregaRepository.findAllByOrderByDataEntregaDesc();
    }

    public List<EntregaCesta> listarPorBeneficiario(Long beneficiarioId) {
        return entregaRepository.findByBeneficiarioIdOrderByDataEntregaDesc(beneficiarioId);
    }

    public EntregaCesta buscarPorId(Long id) {
        return entregaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Entrega de cesta nao encontrada: " + id));
    }

    @Transactional
    public EntregaCesta registrar(EntregaCesta entrega) {
        Beneficiario beneficiario = beneficiarioRepository.findById(entrega.getBeneficiario().getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Beneficiario nao encontrado"));

        Funcionario funcionario = funcionarioRepository.findById(entrega.getRegistradoPor().getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionario nao encontrado"));

        entrega.setBeneficiario(beneficiario);
        entrega.setRegistradoPor(funcionario);

        if (entrega.getItens() == null || entrega.getItens().isEmpty()) {
            throw new IllegalArgumentException("A entrega deve ter pelo menos um item");
        }

        entrega.getItens().forEach(item -> {
            Produto produto = produtoRepository.findById(item.getProduto().getId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Produto nao encontrado: " + item.getProduto().getId()));
            item.setProduto(produto);
            item.setEntregaCesta(entrega);
        });

        return entregaRepository.save(entrega);
    }
}
