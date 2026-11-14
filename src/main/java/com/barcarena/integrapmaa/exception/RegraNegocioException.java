package com.barcarena.integrapmaa.exception;

/** Violacao de uma regra de negocio do programa. */
public class RegraNegocioException extends RuntimeException {
    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
