package com.barcarena.integrapmaa.repository;

import com.barcarena.integrapmaa.model.Agricultor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgricultorRepository extends JpaRepository<Agricultor, Long> {
    Optional<Agricultor> findByCpf(String cpf);
    List<Agricultor> findByAtivoTrueOrderByNome();
    boolean existsByCpf(String cpf);
    boolean existsByNumeroDap(String numeroDap);
    long countByAtivoTrue();
}
