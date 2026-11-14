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

/** RF06 - Recebimento de produtos do agricultor. */
@Entity
@Table(name = "entregas_agricultor")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EntregaAgricultor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "agricultor_id", nullable = false)
    private Agricultor agricultor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "funcionario_id")
    private Funcionario registradoPor;

    @Column(nullable = false)
    private LocalDate dataEntrega;

    @OneToMany(mappedBy = "entregaAgricultor", cascade = CascadeType.ALL, orphanRemoval = true,
               fetch = FetchType.EAGER)
    @JsonManagedReference
    @Builder.Default
    private List<ItemEntregaAgricultor> itens = new ArrayList<>();

    public double calcularTotalKg() {
        return itens.stream().mapToDouble(ItemEntrega::getQuantidadeKg).sum();
    }

    public double calcularValorTotal() {
        return itens.stream().mapToDouble(ItemEntregaAgricultor::calcularSubtotal).sum();
    }
}
