package com.barcarena.pmaa.service;

import com.barcarena.pmaa.exception.RecursoNaoEncontradoException;
import com.barcarena.pmaa.model.Agricultor;
import com.barcarena.pmaa.model.EntregaAgricultor;
import com.barcarena.pmaa.model.Produto;
import com.barcarena.pmaa.repository.AgricultorRepository;
import com.barcarena.pmaa.repository.EntregaAgricultorRepository;
import com.barcarena.pmaa.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EntregaAgricultorService {

    private final EntregaAgricultorRepository entregaRepository;
    private final AgricultorRepository agricultorRepository;
    private final ProdutoRepository produtoRepository;

    public List<EntregaAgricultor> listarTodas() {
        return entregaRepository.findAllByOrderByDataEntregaDesc();
    }

    public List<EntregaAgricultor> listarPorAgricultor(Long agricultorId) {
        return entregaRepository.findByAgricultorIdOrderByDataEntregaDesc(agricultorId);
    }

    public List<EntregaAgricultor> listarPorAgricultorMesAno(Long agricultorId, int mes, int ano) {
        return entregaRepository.findByAgricultorIdAndMesAno(agricultorId, mes, ano);
    }

    public EntregaAgricultor buscarPorId(Long id) {
        return entregaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Entrega nao encontrada: " + id));
    }

    @Transactional
    public EntregaAgricultor registrar(EntregaAgricultor entrega) {
        Agricultor agricultor = agricultorRepository.findById(entrega.getAgricultor().getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Agricultor nao encontrado"));

        entrega.setAgricultor(agricultor);

        if (entrega.getItens() == null || entrega.getItens().isEmpty()) {
            throw new IllegalArgumentException("A entrega deve ter pelo menos um item");
        }

        entrega.getItens().forEach(item -> {
            Produto produto = produtoRepository.findById(item.getProduto().getId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Produto nao encontrado: " + item.getProduto().getId()));
            item.setProduto(produto);
            item.setPrecoPraticado(produto.getPrecoKg());
            item.setEntregaAgricultor(entrega);
        });

        return entregaRepository.save(entrega);
    }
}
