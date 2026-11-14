package com.barcarena.integrapmaa.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Item distribuido a uma entidade beneficiaria. Nao carrega preco:
 * o valor financeiro nao integra o comprovante do beneficiario.
 */
@Entity
@Table(name = "itens_entrega_cesta")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ItemEntregaCesta extends ItemEntrega {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entrega_cesta_id", nullable = false)
    @JsonBackReference
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private EntregaCesta entregaCesta;
}
