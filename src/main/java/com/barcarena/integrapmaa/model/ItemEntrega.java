package com.barcarena.integrapmaa.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Superclasse abstrata dos itens movimentados no programa.
 * Concentra o que e comum as duas pontas do fluxo (recebimento do
 * agricultor e distribuicao ao beneficiario): qual produto e quanto.
 */
@MappedSuperclass
@Data
@NoArgsConstructor
public abstract class ItemEntrega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Positive(message = "Quantidade deve ser maior que zero")
    @Column(nullable = false)
    private double quantidadeKg;
}
