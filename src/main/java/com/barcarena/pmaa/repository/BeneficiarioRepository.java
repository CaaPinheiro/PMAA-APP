package com.barcarena.pmaa.repository;

import com.barcarena.pmaa.model.Beneficiario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BeneficiarioRepository extends JpaRepository<Beneficiario, Long> {
    List<Beneficiario> findByAtivoTrue();
}
