package com.barcarena.pmaa.service;

import com.barcarena.pmaa.exception.RecursoNaoEncontradoException;
import com.barcarena.pmaa.model.Produto;
import com.barcarena.pmaa.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository repository;

    public List<Produto> listarAtivos() {
        return repository.findByAtivoTrue();
    }

    public Produto buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado: " + id));
    }

    @Transactional
    public Produto cadastrar(Produto produto) {
        return repository.save(produto);
    }

    @Transactional
    public Produto editar(Long id, Produto dados) {
        Produto produto = buscarPorId(id);
        produto.setNome(dados.getNome());
        produto.setPrecoKg(dados.getPrecoKg());
        return repository.save(produto);
    }

    @Transactional
    public void excluir(Long id) {
        Produto produto = buscarPorId(id);
        produto.setAtivo(false);
        repository.save(produto);
    }
}
