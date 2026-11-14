package com.barcarena.integrapmaa.config;

import com.barcarena.integrapmaa.model.Funcionario;
import com.barcarena.integrapmaa.model.enums.Papel;
import com.barcarena.integrapmaa.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Cria o administrador inicial quando o banco esta vazio. */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final FuncionarioRepository funcionarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (funcionarioRepository.count() == 0) {
            funcionarioRepository.save(Funcionario.builder()
                    .nome("Administrador do Sistema")
                    .cargo("Administrador")
                    .login("admin")
                    .senha(passwordEncoder.encode("admin123"))
                    .papel(Papel.ADMINISTRADOR)
                    .ativo(true)
                    .build());
            System.out.println(">>> Usuario inicial criado: admin / admin123 - troque a senha!");
        }
    }
}
