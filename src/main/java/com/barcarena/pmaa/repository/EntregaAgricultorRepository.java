package com.barcarena.pmaa.repository;

import com.barcarena.pmaa.model.EntregaAgricultor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntregaAgricultorRepository extends JpaRepository<EntregaAgricultor, Long> {

    List<EntregaAgricultor> findByAgricultorIdOrderByDataEntregaDesc(Long agricultorId);

    List<EntregaAgricultor> findAllByOrderByDataEntregaDesc();

    @Query("SELECT e FROM EntregaAgricultor e WHERE e.agricultor.id = :agricultorId " +
           "AND MONTH(e.dataEntrega) = :mes AND YEAR(e.dataEntrega) = :ano")
    List<EntregaAgricultor> findByAgricultorIdAndMesAno(
            @Param("agricultorId") Long agricultorId,
            @Param("mes") int mes,
            @Param("ano") int ano);
}
