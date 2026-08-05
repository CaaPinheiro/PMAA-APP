package com.barcarena.pmaa.service;

import com.barcarena.pmaa.exception.RecursoNaoEncontradoException;
import com.barcarena.pmaa.model.Agricultor;
import com.barcarena.pmaa.repository.AgricultorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AgricultorService {

    private final AgricultorRepository repository;

    public List<Agricultor> listarAtivos() {
        return repository.findByAtivoTrue();
    }

    public Agricultor buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Agricultor nao encontrado: " + id));
    }

    @Transactional
    public Agricultor cadastrar(Agricultor agricultor) {
        if (repository.existsByCpf(agricultor.getCpf())) {
            throw new IllegalArgumentException("CPF ja cadastrado: " + agricultor.getCpf());
        }
        return repository.save(agricultor);
    }

    @Transactional
    public Agricultor editar(Long id, Agricultor dados) {
        Agricultor agricultor = buscarPorId(id);
        agricultor.setNome(dados.getNome());
        agricultor.setEmail(dados.getEmail());
        agricultor.setTelefone(dados.getTelefone());
        agricultor.setNumeroDap(dados.getNumeroDap());
        agricultor.setValidadeDap(dados.getValidadeDap());
        agricultor.setObservacoes(dados.getObservacoes());
        agricultor.setEndereco(dados.getEndereco());
        return repository.save(agricultor);
    }

    @Transactional
    public void excluir(Long id) {
        Agricultor agricultor = buscarPorId(id);
        agricultor.setAtivo(false);
        repository.save(agricultor);
    }
}
