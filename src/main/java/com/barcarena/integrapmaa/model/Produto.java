package com.barcarena.integrapmaa.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** RF03 - Cadastro de produtos: Nome e Preco. */
@Entity
@Table(name = "produtos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome do produto e obrigatorio")
    @Column(nullable = false)
    private String nome;

    @Positive(message = "Preco deve ser maior que zero")
    @Column(nullable = false)
    private double precoKg;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;
}
