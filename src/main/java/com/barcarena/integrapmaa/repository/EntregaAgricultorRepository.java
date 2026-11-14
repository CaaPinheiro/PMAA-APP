package com.barcarena.integrapmaa.repository;

import com.barcarena.integrapmaa.model.EntregaAgricultor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntregaAgricultorRepository extends JpaRepository<EntregaAgricultor, Long> {

    List<EntregaAgricultor> findAllByOrderByDataEntregaDescIdDesc();

    List<EntregaAgricultor> findByAgricultorIdOrderByDataEntregaDescIdDesc(Long agricultorId);

    @Query("SELECT e FROM EntregaAgricultor e " +
           "WHERE e.agricultor.id = :agricultorId " +
           "AND MONTH(e.dataEntrega) = :mes AND YEAR(e.dataEntrega) = :ano " +
           "ORDER BY e.dataEntrega")
    List<EntregaAgricultor> buscarPorAgricultorNoPeriodo(@Param("agricultorId") Long agricultorId,
                                                         @Param("mes") int mes,
                                                         @Param("ano") int ano);

    @Query("SELECT e FROM EntregaAgricultor e " +
           "WHERE MONTH(e.dataEntrega) = :mes AND YEAR(e.dataEntrega) = :ano " +
           "ORDER BY e.agricultor.nome, e.dataEntrega")
    List<EntregaAgricultor> buscarPorPeriodo(@Param("mes") int mes, @Param("ano") int ano);
}
