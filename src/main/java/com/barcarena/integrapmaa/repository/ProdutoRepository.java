package com.barcarena.integrapmaa.repository;

import com.barcarena.integrapmaa.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    List<Produto> findByAtivoTrueOrderByNome();
    long countByAtivoTrue();
}
