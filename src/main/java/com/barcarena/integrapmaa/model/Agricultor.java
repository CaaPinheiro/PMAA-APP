package com.barcarena.integrapmaa.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * RF01 - Cadastro de agricultores.
 * Armazena Nome, CPF, Endereco, E-mail, Telefone, N. DAP, Validade DAP,
 * Produtos Fornecidos e Observacoes.
 */
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

    @Embedded
    private Endereco endereco;

    /** Produtos que este agricultor fornece ao programa (RF01). */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "agricultor_produtos",
            joinColumns = @JoinColumn(name = "agricultor_id"),
            inverseJoinColumns = @JoinColumn(name = "produto_id"))
    @Builder.Default
    private Set<Produto> produtosFornecidos = new LinkedHashSet<>();

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;

    /** Indica se a DAP do agricultor esta vencida na data de hoje. */
    public boolean isDapVencida() {
        return validadeDap != null && validadeDap.isBefore(LocalDate.now());
    }
}
