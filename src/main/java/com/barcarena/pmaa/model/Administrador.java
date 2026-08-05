package com.barcarena.pmaa.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "administradores")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@SuperBuilder
public class Administrador extends Funcionario {
    // Herda todos os atributos de Funcionario.
    // Permissoes elevadas sao controladas via Spring Security (ROLE_ADMINISTRADOR).
}
