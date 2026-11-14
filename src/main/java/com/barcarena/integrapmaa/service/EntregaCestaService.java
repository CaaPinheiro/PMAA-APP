package com.barcarena.integrapmaa.service;

import com.barcarena.integrapmaa.exception.RecursoNaoEncontradoException;
import com.barcarena.integrapmaa.exception.RegraNegocioException;
import com.barcarena.integrapmaa.model.*;
import com.barcarena.integrapmaa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** RF04 - Registro da entrega de cestas as entidades beneficiarias. */
@Service
@RequiredArgsConstructor
public class EntregaCestaService {

    private final EntregaCestaRepository entregaRepository;
    private final BeneficiarioRepository beneficiarioRepository;
    private final ProdutoRepository produtoRepository;
    private final FuncionarioRepository funcionarioRepository;

    public List<EntregaCesta> listarTodas() {
        return entregaRepository.findAllByOrderByDataEntregaDescIdDesc();
    }

    public List<EntregaCesta> listarPorBeneficiario(Long beneficiarioId) {
        return entregaRepository.findByBeneficiarioIdOrderByDataEntregaDescIdDesc(beneficiarioId);
    }

    public EntregaCesta buscarPorId(Long id) {
        return entregaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Entrega de cesta nao encontrada: " + id));
    }

    @Transactional
    public EntregaCesta registrar(EntregaCesta dados, String loginUsuario) {
        if (dados.getBeneficiario() == null || dados.getBeneficiario().getId() == null) {
            throw new RegraNegocioException("Informe a entidade beneficiaria");
        }
        if (dados.getDataEntrega() == null) {
            throw new RegraNegocioException("Informe a data da entrega");
        }
        if (dados.getItens() == null || dados.getItens().isEmpty()) {
            throw new RegraNegocioException("A cesta deve conter pelo menos um item");
        }

        Beneficiario beneficiario = beneficiarioRepository.findById(dados.getBeneficiario().getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Beneficiario nao encontrado"));

        Funcionario responsavel = funcionarioRepository.findByLogin(loginUsuario)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionario nao encontrado"));

        EntregaCesta entrega = EntregaCesta.builder()
                .beneficiario(beneficiario)
                .registradoPor(responsavel)
                .dataEntrega(dados.getDataEntrega())
                .quantidadeCestas(Math.max(1, dados.getQuantidadeCestas()))
                .build();

        for (ItemEntregaCesta item : dados.getItens()) {
            if (item.getProduto() == null || item.getProduto().getId() == null) {
                throw new RegraNegocioException("Selecione o produto de cada item");
            }
            if (item.getQuantidadeKg() <= 0) {
                throw new RegraNegocioException("A quantidade de cada item deve ser maior que zero");
            }
            Produto produto = produtoRepository.findById(item.getProduto().getId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Produto nao encontrado: " + item.getProduto().getId()));

            ItemEntregaCesta novo = new ItemEntregaCesta();
            novo.setProduto(produto);
            novo.setQuantidadeKg(item.getQuantidadeKg());
            novo.setEntregaCesta(entrega);
            entrega.getItens().add(novo);
        }

        return entregaRepository.save(entrega);
    }

    @Transactional
    public void excluir(Long id) {
        entregaRepository.delete(buscarPorId(id));
    }
}
