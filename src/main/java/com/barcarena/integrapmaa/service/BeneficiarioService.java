package com.barcarena.integrapmaa.service;

import com.barcarena.integrapmaa.exception.RecursoNaoEncontradoException;
import com.barcarena.integrapmaa.model.Beneficiario;
import com.barcarena.integrapmaa.repository.BeneficiarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** RF02 - Cadastro de beneficiarios. */
@Service
@RequiredArgsConstructor
public class BeneficiarioService {

    private final BeneficiarioRepository repository;

    public List<Beneficiario> listarAtivos() {
        return repository.findByAtivoTrueOrderByNome();
    }

    public Beneficiario buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Beneficiario nao encontrado: " + id));
    }

    @Transactional
    public Beneficiario cadastrar(Beneficiario dados) {
        dados.setId(null);
        dados.setAtivo(true);
        return repository.save(dados);
    }

    @Transactional
    public Beneficiario editar(Long id, Beneficiario dados) {
        Beneficiario b = buscarPorId(id);
        b.setNome(dados.getNome());
        b.setResponsavel(dados.getResponsavel());
        b.setEmail(dados.getEmail());
        b.setTelefone(dados.getTelefone());
        b.setEndereco(dados.getEndereco());
        b.setPublicoAtendido(dados.getPublicoAtendido());
        b.setRefeicoesOfertadas(dados.getRefeicoesOfertadas());
        return repository.save(b);
    }

    @Transactional
    public void excluir(Long id) {
        Beneficiario b = buscarPorId(id);
        b.setAtivo(false);
        repository.save(b);
    }
}
