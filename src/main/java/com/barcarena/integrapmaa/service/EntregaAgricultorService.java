package com.barcarena.integrapmaa.service;

import com.barcarena.integrapmaa.exception.RecursoNaoEncontradoException;
import com.barcarena.integrapmaa.exception.RegraNegocioException;
import com.barcarena.integrapmaa.model.*;
import com.barcarena.integrapmaa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** RF06 - Registro do recebimento de produtos dos agricultores. */
@Service
@RequiredArgsConstructor
public class EntregaAgricultorService {

    private final EntregaAgricultorRepository entregaRepository;
    private final AgricultorRepository agricultorRepository;
    private final ProdutoRepository produtoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final PagamentoRepository pagamentoRepository;

    public List<EntregaAgricultor> listarTodas() {
        return entregaRepository.findAllByOrderByDataEntregaDescIdDesc();
    }

    public List<EntregaAgricultor> listarPorAgricultor(Long agricultorId) {
        return entregaRepository.findByAgricultorIdOrderByDataEntregaDescIdDesc(agricultorId);
    }

    public EntregaAgricultor buscarPorId(Long id) {
        return entregaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Entrega nao encontrada: " + id));
    }

    @Transactional
    public EntregaAgricultor registrar(EntregaAgricultor dados, String loginUsuario) {
        if (dados.getAgricultor() == null || dados.getAgricultor().getId() == null) {
            throw new RegraNegocioException("Informe o agricultor da entrega");
        }
        if (dados.getDataEntrega() == null) {
            throw new RegraNegocioException("Informe a data da entrega");
        }
        if (dados.getItens() == null || dados.getItens().isEmpty()) {
            throw new RegraNegocioException("A entrega deve conter pelo menos um item");
        }

        Agricultor agricultor = agricultorRepository.findById(dados.getAgricultor().getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Agricultor nao encontrado"));

        bloquearSePeriodoJaPago(agricultor.getId(),
                dados.getDataEntrega().getMonthValue(),
                dados.getDataEntrega().getYear());

        EntregaAgricultor entrega = EntregaAgricultor.builder()
                .agricultor(agricultor)
                .dataEntrega(dados.getDataEntrega())
                .registradoPor(funcionarioRepository.findByLogin(loginUsuario).orElse(null))
                .build();

        for (ItemEntregaAgricultor item : dados.getItens()) {
            if (item.getProduto() == null || item.getProduto().getId() == null) {
                throw new RegraNegocioException("Selecione o produto de cada item");
            }
            if (item.getQuantidadeKg() <= 0) {
                throw new RegraNegocioException("A quantidade de cada item deve ser maior que zero");
            }
            Produto produto = produtoRepository.findById(item.getProduto().getId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Produto nao encontrado: " + item.getProduto().getId()));

            ItemEntregaAgricultor novo = new ItemEntregaAgricultor();
            novo.setProduto(produto);
            novo.setQuantidadeKg(item.getQuantidadeKg());
            // Congela o preco vigente: reajustes futuros nao alteram o passado.
            novo.setPrecoPraticado(produto.getPrecoKg());
            novo.setEntregaAgricultor(entrega);
            entrega.getItens().add(novo);
        }

        return entregaRepository.save(entrega);
    }

    @Transactional
    public void excluir(Long id) {
        EntregaAgricultor entrega = buscarPorId(id);
        bloquearSePeriodoJaPago(entrega.getAgricultor().getId(),
                entrega.getDataEntrega().getMonthValue(),
                entrega.getDataEntrega().getYear());
        entregaRepository.delete(entrega);
    }

    /** Um periodo ja pago nao pode receber nem perder entregas. */
    private void bloquearSePeriodoJaPago(Long agricultorId, int mes, int ano) {
        pagamentoRepository.findByAgricultorIdAndMesReferenciaAndAnoReferencia(agricultorId, mes, ano)
                .ifPresent(p -> {
                    throw new RegraNegocioException(
                            "O pagamento de " + mes + "/" + ano + " deste agricultor ja foi autorizado. "
                          + "As entregas do periodo nao podem mais ser alteradas.");
                });
    }
}
