package com.barcarena.pmaa.config;

import com.barcarena.pmaa.model.Administrador;
import com.barcarena.pmaa.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final FuncionarioRepository funcionarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (funcionarioRepository.count() == 0) {
            Administrador admin = Administrador.builder()
                    .nome("Administrador do Sistema")
                    .cargo("Administrador")
                    .login("admin")
                    .senha(passwordEncoder.encode("admin123"))
                    .ativo(true)
                    .build();
            funcionarioRepository.save(admin);
            System.out.println(">>> Usuario inicial criado: login=admin senha=admin123 (troque a senha!)");
        }
    }
}
