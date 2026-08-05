package com.barcarena.pmaa.repository;

import com.barcarena.pmaa.model.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {
    List<Pagamento> findByAgricultorId(Long agricultorId);
    List<Pagamento> findAllByOrderByDataPagamentoDesc();
    Optional<Pagamento> findByAgricultorIdAndMesReferenciaAndAnoReferencia(
            Long agricultorId, int mes, int ano);
}
