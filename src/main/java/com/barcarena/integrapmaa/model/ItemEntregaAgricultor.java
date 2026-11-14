package com.barcarena.integrapmaa.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Item recebido de um agricultor. Registra o preco praticado no momento
 * da entrega, para que alteracoes futuras no catalogo de produtos nao
 * modifiquem retroativamente valores ja apurados.
 */
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
