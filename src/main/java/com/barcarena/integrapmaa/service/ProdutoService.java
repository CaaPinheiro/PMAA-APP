package com.barcarena.integrapmaa.service;

import com.barcarena.integrapmaa.exception.RecursoNaoEncontradoException;
import com.barcarena.integrapmaa.model.Produto;
import com.barcarena.integrapmaa.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** RF03 - Cadastro de produtos. */
@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository repository;

    public List<Produto> listarAtivos() {
        return repository.findByAtivoTrueOrderByNome();
    }

    public Produto buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado: " + id));
    }

    @Transactional
    public Produto cadastrar(Produto produto) {
        produto.setId(null);
        produto.setAtivo(true);
        return repository.save(produto);
    }

    @Transactional
    public Produto editar(Long id, Produto dados) {
        Produto produto = buscarPorId(id);
        produto.setNome(dados.getNome());
        produto.setPrecoKg(dados.getPrecoKg());
        return repository.save(produto);
    }

    /**
     * Exclusao logica: o produto some do catalogo mas permanece nas
     * entregas ja registradas, preservando o historico.
     */
    @Transactional
    public void excluir(Long id) {
        Produto produto = buscarPorId(id);
        produto.setAtivo(false);
        repository.save(produto);
    }
}
