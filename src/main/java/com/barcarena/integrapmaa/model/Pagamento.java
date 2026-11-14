package com.barcarena.integrapmaa.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Registro de que o saldo mensal de um agricultor (RF05) foi
 * autorizado para pagamento por um administrador.
 */
@Entity
@Table(name = "pagamentos",
       uniqueConstraints = @UniqueConstraint(
           name = "uk_pagamento_agricultor_periodo",
           columnNames = {"agricultor_id", "mes_referencia", "ano_referencia"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "agricultor_id", nullable = false)
    private Agricultor agricultor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "autorizado_por_id", nullable = false)
    private Funcionario autorizadoPor;

    @Column(name = "mes_referencia", nullable = false)
    private int mesReferencia;

    @Column(name = "ano_referencia", nullable = false)
    private int anoReferencia;

    @Column(nullable = false)
    private double valorTotal;

    @Column(nullable = false)
    private double quantidadeTotalKg;

    @Column(nullable = false)
    private int totalEntregas;

    @Column(nullable = false)
    private LocalDate dataPagamento;
}
