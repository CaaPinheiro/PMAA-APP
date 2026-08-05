package com.barcarena.pmaa.repository;

import com.barcarena.pmaa.model.EntregaCesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntregaCestaRepository extends JpaRepository<EntregaCesta, Long> {
    List<EntregaCesta> findByBeneficiarioIdOrderByDataEntregaDesc(Long beneficiarioId);
    List<EntregaCesta> findAllByOrderByDataEntregaDesc();
}
