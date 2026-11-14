package com.barcarena.integrapmaa.repository;

import com.barcarena.integrapmaa.model.EntregaCesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntregaCestaRepository extends JpaRepository<EntregaCesta, Long> {

    List<EntregaCesta> findAllByOrderByDataEntregaDescIdDesc();

    List<EntregaCesta> findByBeneficiarioIdOrderByDataEntregaDescIdDesc(Long beneficiarioId);

    @Query("SELECT e FROM EntregaCesta e " +
           "WHERE MONTH(e.dataEntrega) = :mes AND YEAR(e.dataEntrega) = :ano " +
           "ORDER BY e.beneficiario.nome, e.dataEntrega")
    List<EntregaCesta> buscarPorPeriodo(@Param("mes") int mes, @Param("ano") int ano);
}
