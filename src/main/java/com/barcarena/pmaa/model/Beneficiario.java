package com.barcarena.pmaa.model;

import com.barcarena.pmaa.model.enums.FaixaEtaria;
import com.barcarena.pmaa.model.enums.TipoRefeicao;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

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

    @NotBlank(message = "Nome e obrigatorio")
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
    @CollectionTable(name = "beneficiario_faixas_etarias",
            joinColumns = @JoinColumn(name = "beneficiario_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "faixa_etaria")
    private Set<FaixaEtaria> publicoAtendido;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "beneficiario_refeicoes",
            joinColumns = @JoinColumn(name = "beneficiario_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_refeicao")
    private Set<TipoRefeicao> refeicoesOfertadas;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;
}
