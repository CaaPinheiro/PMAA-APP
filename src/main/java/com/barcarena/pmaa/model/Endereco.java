package com.barcarena.pmaa.model;

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
        if (logradouro != null && !logradouro.isBlank()) sb.append(logradouro);
        if (numero != null && !numero.isBlank()) sb.append(", ").append(numero);
        if (localidadeRegiao != null && !localidadeRegiao.isBlank()) sb.append(" - ").append(localidadeRegiao);
        if (cidade != null && !cidade.isBlank()) sb.append(", ").append(cidade);
        if (uf != null && !uf.isBlank()) sb.append(" - ").append(uf);
        return sb.length() > 0 ? sb.toString() : "Endereco nao informado";
    }
}
