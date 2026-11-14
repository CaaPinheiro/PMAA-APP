package com.barcarena.integrapmaa.repository;

import com.barcarena.integrapmaa.model.Beneficiario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BeneficiarioRepository extends JpaRepository<Beneficiario, Long> {
    List<Beneficiario> findByAtivoTrueOrderByNome();
    long countByAtivoTrue();
}
