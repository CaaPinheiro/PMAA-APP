package com.barcarena.integrapmaa.service;

import com.barcarena.integrapmaa.exception.RecursoNaoEncontradoException;
import com.barcarena.integrapmaa.exception.RegraNegocioException;
import com.barcarena.integrapmaa.model.Agricultor;
import com.barcarena.integrapmaa.model.Produto;
import com.barcarena.integrapmaa.repository.AgricultorRepository;
import com.barcarena.integrapmaa.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** RF01 - Cadastro de agricultores. */
@Service
@RequiredArgsConstructor
public class AgricultorService {

    private final AgricultorRepository repository;
    private final ProdutoRepository produtoRepository;

    public List<Agricultor> listarAtivos() {
        return repository.findByAtivoTrueOrderByNome();
    }

    public Agricultor buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Agricultor nao encontrado: " + id));
    }

    @Transactional
    public Agricultor cadastrar(Agricultor dados) {
        if (repository.existsByCpf(dados.getCpf())) {
            throw new RegraNegocioException("Ja existe um agricultor cadastrado com o CPF " + dados.getCpf());
        }
        if (repository.existsByNumeroDap(dados.getNumeroDap())) {
            throw new RegraNegocioException("Ja existe um agricultor com a DAP " + dados.getNumeroDap());
        }
        dados.setId(null);
        dados.setAtivo(true);
        dados.setProdutosFornecidos(resolverProdutos(dados.getProdutosFornecidos()));
        return repository.save(dados);
    }

    @Transactional
    public Agricultor editar(Long id, Agricultor dados) {
        Agricultor agricultor = buscarPorId(id);
        agricultor.setNome(dados.getNome());
        agricultor.setEmail(dados.getEmail());
        agricultor.setTelefone(dados.getTelefone());
        agricultor.setNumeroDap(dados.getNumeroDap());
        agricultor.setValidadeDap(dados.getValidadeDap());
        agricultor.setEndereco(dados.getEndereco());
        agricultor.setObservacoes(dados.getObservacoes());
        agricultor.setProdutosFornecidos(resolverProdutos(dados.getProdutosFornecidos()));
        return repository.save(agricultor);
    }

    @Transactional
    public void excluir(Long id) {
        Agricultor agricultor = buscarPorId(id);
        agricultor.setAtivo(false);
        repository.save(agricultor);
    }

    /** Converte as referencias recebidas do cliente em entidades gerenciadas. */
    private Set<Produto> resolverProdutos(Set<Produto> referencias) {
        Set<Produto> produtos = new LinkedHashSet<>();
        if (referencias == null) return produtos;
        for (Produto ref : referencias) {
            if (ref == null || ref.getId() == null) continue;
            produtos.add(produtoRepository.findById(ref.getId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Produto nao encontrado: " + ref.getId())));
        }
        return produtos;
    }
}
