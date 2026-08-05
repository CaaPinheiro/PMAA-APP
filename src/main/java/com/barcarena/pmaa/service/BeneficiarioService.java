package com.barcarena.pmaa.service;

import com.barcarena.pmaa.exception.RecursoNaoEncontradoException;
import com.barcarena.pmaa.model.Beneficiario;
import com.barcarena.pmaa.repository.BeneficiarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BeneficiarioService {

    private final BeneficiarioRepository repository;

    public List<Beneficiario> listarAtivos() {
        return repository.findByAtivoTrue();
    }

    public Beneficiario buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Beneficiario nao encontrado: " + id));
    }

    @Transactional
    public Beneficiario cadastrar(Beneficiario beneficiario) {
        return repository.save(beneficiario);
    }

    @Transactional
    public Beneficiario editar(Long id, Beneficiario dados) {
        Beneficiario beneficiario = buscarPorId(id);
        beneficiario.setNome(dados.getNome());
        beneficiario.setResponsavel(dados.getResponsavel());
        beneficiario.setEmail(dados.getEmail());
        beneficiario.setTelefone(dados.getTelefone());
        beneficiario.setEndereco(dados.getEndereco());
        beneficiario.setPublicoAtendido(dados.getPublicoAtendido());
        beneficiario.setRefeicoesOfertadas(dados.getRefeicoesOfertadas());
        return repository.save(beneficiario);
    }

    @Transactional
    public void excluir(Long id) {
        Beneficiario beneficiario = buscarPorId(id);
        beneficiario.setAtivo(false);
        repository.save(beneficiario);
    }
}
