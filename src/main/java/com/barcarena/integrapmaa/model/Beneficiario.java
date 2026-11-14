package com.barcarena.integrapmaa.model;

import com.barcarena.integrapmaa.model.enums.FaixaEtaria;
import com.barcarena.integrapmaa.model.enums.TipoRefeicao;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.LinkedHashSet;
import java.util.Set;

/**
 * RF02 - Cadastro de beneficiarios.
 * Armazena Nome da Entidade, Responsavel, E-mail, Telefone, Endereco,
 * Publico Atendido e Refeicoes Ofertadas.
 */
@Entity
@Table(name = "beneficiarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Beneficiario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome da entidade e obrigatorio")
    @Column(nullable = false)
    private String nome;

    @NotBlank(message = "Responsavel e obrigatorio")
    @Column(nullable = false)
    private String responsavel;

    private String email;
    private String telefone;

    @Embedded
    private Endereco endereco;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "beneficiario_publico_atendido",
            joinColumns = @JoinColumn(name = "beneficiario_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "faixa_etaria")
    @Builder.Default
    private Set<FaixaEtaria> publicoAtendido = new LinkedHashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "beneficiario_refeicoes",
            joinColumns = @JoinColumn(name = "beneficiario_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_refeicao")
    @Builder.Default
    private Set<TipoRefeicao> refeicoesOfertadas = new LinkedHashSet<>();

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;
}
