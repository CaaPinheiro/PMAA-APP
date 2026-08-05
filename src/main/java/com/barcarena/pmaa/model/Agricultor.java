package com.barcarena.pmaa.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "agricultores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Agricultor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome e obrigatorio")
    @Column(nullable = false)
    private String nome;

    @NotBlank(message = "CPF e obrigatorio")
    @Column(nullable = false, unique = true, length = 14)
    private String cpf;

    private String email;
    private String telefone;

    @NotBlank(message = "Numero da DAP e obrigatorio")
    @Column(nullable = false, unique = true)
    private String numeroDap;

    @Column(nullable = false)
    private LocalDate validadeDap;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Embedded
    private Endereco endereco;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;
}
