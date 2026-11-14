package com.barcarena.integrapmaa.service;

import com.barcarena.integrapmaa.exception.RecursoNaoEncontradoException;
import com.barcarena.integrapmaa.exception.RegraNegocioException;
import com.barcarena.integrapmaa.model.Funcionario;
import com.barcarena.integrapmaa.model.enums.Papel;
import com.barcarena.integrapmaa.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * RF07 - Controle administrativo: conceder, editar e remover o acesso
 * de funcionarios.
 */
@Service
@RequiredArgsConstructor
public class FuncionarioService {

    private static final int TAMANHO_MINIMO_SENHA = 6;

    private final FuncionarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public List<Funcionario> listar() {
        return repository.findAllByOrderByNome();
    }

    public Funcionario buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionario nao encontrado: " + id));
    }

    /** Concede acesso: cria um novo funcionario com o papel informado. */
    @Transactional
    public Funcionario conceder(String nome, String cargo, String login, String senha, Papel papel) {
        if (login == null || login.isBlank()) {
            throw new RegraNegocioException("Informe o login do funcionario");
        }
        if (repository.existsByLogin(login)) {
            throw new RegraNegocioException("Ja existe um funcionario com o login " + login);
        }
        validarSenha(senha);

        return repository.save(Funcionario.builder()
                .nome(nome)
                .cargo(cargo)
                .login(login)
                .senha(passwordEncoder.encode(senha))
                .papel(papel == null ? Papel.FUNCIONARIO : papel)
                .ativo(true)
                .build());
    }

    /** Edita os dados e o nivel de acesso de um funcionario existente. */
    @Transactional
    public Funcionario editar(Long id, String nome, String cargo, Papel papel, Long idSolicitante) {
        Funcionario funcionario = buscarPorId(id);

        if (papel != null && papel != funcionario.getPapel()) {
            if (funcionario.getId().equals(idSolicitante)) {
                throw new RegraNegocioException(
                        "Voce nao pode alterar o proprio nivel de acesso");
            }
            garantirQueRestaAdministrador(funcionario, papel);
            funcionario.setPapel(papel);
        }

        funcionario.setNome(nome);
        funcionario.setCargo(cargo);
        return repository.save(funcionario);
    }

    /** Remove ou restaura o acesso (exclusao logica). */
    @Transactional
    public Funcionario alternarAtivo(Long id, Long idSolicitante) {
        Funcionario funcionario = buscarPorId(id);

        if (funcionario.getId().equals(idSolicitante)) {
            throw new RegraNegocioException("Voce nao pode desativar o proprio usuario");
        }
        if (funcionario.isAtivo()) {
            garantirQueRestaAdministrador(funcionario, null);
        }

        funcionario.setAtivo(!funcionario.isAtivo());
        return repository.save(funcionario);
    }

    @Transactional
    public void redefinirSenha(Long id, String novaSenha) {
        validarSenha(novaSenha);
        Funcionario funcionario = buscarPorId(id);
        funcionario.setSenha(passwordEncoder.encode(novaSenha));
        repository.save(funcionario);
    }

    private void validarSenha(String senha) {
        if (senha == null || senha.length() < TAMANHO_MINIMO_SENHA) {
            throw new RegraNegocioException(
                    "A senha deve ter no minimo " + TAMANHO_MINIMO_SENHA + " caracteres");
        }
    }

    /**
     * Impede que a ultima conta de administrador ativa seja rebaixada ou
     * desativada, o que deixaria o sistema sem quem administre o acesso.
     */
    private void garantirQueRestaAdministrador(Funcionario alvo, Papel novoPapel) {
        boolean perdeAdmin = alvo.isAdministrador()
                && (novoPapel == null || novoPapel != Papel.ADMINISTRADOR);
        if (!perdeAdmin) return;

        long administradoresAtivos = repository.countByPapelAndAtivoTrue(Papel.ADMINISTRADOR);
        if (administradoresAtivos <= 1) {
            throw new RegraNegocioException(
                    "Esta e a unica conta de administrador ativa. Promova outro funcionario antes.");
        }
    }
}
