package com.barcarena.pmaa.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "itens_entrega_agricultor")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ItemEntregaAgricultor extends ItemEntrega {

    @Column(nullable = false)
    private double precoPraticado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entrega_agricultor_id", nullable = false)
    @JsonBackReference
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private EntregaAgricultor entregaAgricultor;

    public double calcularSubtotal() {
        return getQuantidadeKg() * precoPraticado;
    }
}
