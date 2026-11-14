package com.barcarena.integrapmaa.model.enums;

/**
 * Nivel de acesso do funcionario (RF07).
 * Modelado como atributo — e nao como subclasse — para permitir que o
 * administrador altere o nivel de acesso de um funcionario ja cadastrado.
 */
public enum Papel {
    FUNCIONARIO,
    ADMINISTRADOR
}
