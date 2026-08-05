package com.barcarena.pmaa.repository;

import com.barcarena.pmaa.model.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    Optional<Funcionario> findByLogin(String login);
    boolean existsByLogin(String login);
}
