package com.barcarena.integrapmaa.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Endereco {

    private String logradouro;
    private String numero;
    private String complemento;
    private String bairroComunidade;
    private String localidadeRegiao;
    private String cidade;
    private String uf;
    private String cep;

    public String obterEnderecoCompleto() {
        StringBuilder sb = new StringBuilder();
        if (preenchido(logradouro)) sb.append(logradouro);
        if (preenchido(numero)) sb.append(", ").append(numero);
        if (preenchido(bairroComunidade)) sb.append(" - ").append(bairroComunidade);
        if (preenchido(localidadeRegiao)) sb.append(" - ").append(localidadeRegiao);
        if (preenchido(cidade)) sb.append(", ").append(cidade);
        if (preenchido(uf)) sb.append("/").append(uf);
        return sb.length() > 0 ? sb.toString() : "Endereco nao informado";
    }

    private boolean preenchido(String s) {
        return s != null && !s.isBlank();
    }
}
