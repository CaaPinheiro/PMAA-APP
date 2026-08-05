package com.barcarena.pmaa.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "pagamentos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agricultor_id", nullable = false)
    private Agricultor agricultor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "administrador_id", nullable = false)
    private Administrador autorizadoPor;

    @Column(nullable = false)
    private int mesReferencia;

    @Column(nullable = false)
    private int anoReferencia;

    @Column(nullable = false)
    private double valorTotal;

    @Column(nullable = false)
    private LocalDate dataPagamento;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "pagamento_entregas",
            joinColumns = @JoinColumn(name = "pagamento_id"),
            inverseJoinColumns = @JoinColumn(name = "entrega_id"))
    private List<EntregaAgricultor> entregas;
}
