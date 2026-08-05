package com.barcarena.pmaa.service;

import com.barcarena.pmaa.exception.RecursoNaoEncontradoException;
import com.barcarena.pmaa.model.Administrador;
import com.barcarena.pmaa.model.Funcionario;
import com.barcarena.pmaa.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FuncionarioService {

    private final FuncionarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public List<Funcionario> listar() {
        return repository.findAll();
    }

    @Transactional
    public Funcionario cadastrar(String nome, String cargo, String login, String senha, boolean admin) {
        if (repository.existsByLogin(login)) {
            throw new IllegalArgumentException("Login ja existe: " + login);
        }
        if (senha == null || senha.length() < 6) {
            throw new IllegalArgumentException("A senha deve ter no minimo 6 caracteres");
        }

        Funcionario funcionario;
        if (admin) {
            funcionario = Administrador.builder()
                    .nome(nome).cargo(cargo).login(login)
                    .senha(passwordEncoder.encode(senha))
                    .ativo(true)
                    .build();
        } else {
            funcionario = Funcionario.builder()
                    .nome(nome).cargo(cargo).login(login)
                    .senha(passwordEncoder.encode(senha))
                    .ativo(true)
                    .build();
        }
        return repository.save(funcionario);
    }

    @Transactional
    public Funcionario alternarAtivo(Long id) {
        Funcionario funcionario = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionario nao encontrado: " + id));
        funcionario.setAtivo(!funcionario.isAtivo());
        return repository.save(funcionario);
    }
}
