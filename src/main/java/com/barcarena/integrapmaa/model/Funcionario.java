package com.barcarena.integrapmaa.model;

import com.barcarena.integrapmaa.model.enums.Papel;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * RF07 - Controle administrativo.
 * O nivel de acesso e um atributo (Papel), permitindo conceder, editar
 * e remover o acesso de funcionarios ja cadastrados.
 */
@Entity
@Table(name = "funcionarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome e obrigatorio")
    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String cargo;

    @NotBlank(message = "Login e obrigatorio")
    @Column(nullable = false, unique = true)
    private String login;

    /** Nunca e devolvida ao cliente; armazenada com hash BCrypt. */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Papel papel = Papel.FUNCIONARIO;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;

    public boolean isAdministrador() {
        return papel == Papel.ADMINISTRADOR;
    }
}
