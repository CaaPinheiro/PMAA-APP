package com.barcarena.integrapmaa.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** RF04 - Entrega de cestas as entidades beneficiarias. */
@Entity
@Table(name = "entregas_cesta")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EntregaCesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "beneficiario_id", nullable = false)
    private Beneficiario beneficiario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Funcionario registradoPor;

    @Column(nullable = false)
    private LocalDate dataEntrega;

    @Column(nullable = false)
    @Builder.Default
    private int quantidadeCestas = 1;

    @OneToMany(mappedBy = "entregaCesta", cascade = CascadeType.ALL, orphanRemoval = true,
               fetch = FetchType.EAGER)
    @JsonManagedReference
    @Builder.Default
    private List<ItemEntregaCesta> itens = new ArrayList<>();

    public double calcularTotalKg() {
        return itens.stream().mapToDouble(ItemEntrega::getQuantidadeKg).sum();
    }
}
