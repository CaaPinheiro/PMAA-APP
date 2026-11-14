package com.barcarena.integrapmaa.repository;

import com.barcarena.integrapmaa.model.Funcionario;
import com.barcarena.integrapmaa.model.enums.Papel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    Optional<Funcionario> findByLogin(String login);
    boolean existsByLogin(String login);
    List<Funcionario> findAllByOrderByNome();
    long countByPapelAndAtivoTrue(Papel papel);
}
