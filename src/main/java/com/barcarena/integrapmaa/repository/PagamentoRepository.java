package com.barcarena.integrapmaa.repository;

import com.barcarena.integrapmaa.model.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {
    List<Pagamento> findAllByOrderByDataPagamentoDescIdDesc();
    List<Pagamento> findByAgricultorIdOrderByAnoReferenciaDescMesReferenciaDesc(Long agricultorId);
    Optional<Pagamento> findByAgricultorIdAndMesReferenciaAndAnoReferencia(Long agricultorId, int mes, int ano);
}
