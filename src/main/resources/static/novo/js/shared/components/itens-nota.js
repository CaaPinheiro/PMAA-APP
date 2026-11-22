import { el, limpar } from '../utils/dom.js';
import { icone } from '../../layout/icons.js';
import { formatarBRL } from '../utils/money.js';
import { formatarQuantidade, paraNumero } from '../utils/formatters.js';
import { criarListState } from './list-state.js';

/**
 * Tabela de itens de uma nota (recebimento ou entrega).
 *
 * A soma de quantidades é a soma das quantidades de todos os produtos — não é
 * contagem de linhas nem de produtos distintos. Os valores chegam calculados
 * pelo backend; o componente apenas exibe e soma o que recebeu.
 *
 * @typedef {{
 *   produto: string,
 *   quantidade: number|null,
 *   unidade?: string|null,
 *   valorUnitario?: number|null,
 *   subtotal?: number|null
 * }} ItemNota
 *
 * @param {{
 *   itens?: ItemNota[],
 *   exibirValores?: boolean,
 *   unidadePadrao?: string,
 *   rotuloTotal?: string,
 *   rotuloQuantidade?: string,
 *   mensagemVazio?: string,
 *   aoRemover?: ((item: ItemNota, indice: number) => void)|null
 * }} opcoes
 */
export function criarItensNota({
  itens = [],
  exibirValores = false,
  unidadePadrao = 'kg',
  rotuloTotal = 'Total',
  rotuloQuantidade = 'Quantidade',
  mensagemVazio = 'Nenhum item adicionado.',
  aoRemover = null
}) {
  const elemento = el('div', { class: 'itens-nota' });
  let atuais = itens;

  function renderizar() {
    limpar(elemento);

    if (!atuais || atuais.length === 0) {
      elemento.appendChild(criarListState({ estado: 'vazio', mensagem: mensagemVazio }));
      return;
    }

    const cabecalho = el('tr', {}, [
      el('th', { scope: 'col', text: 'Produto' }),
      el('th', { scope: 'col', class: 'is-numeric', text: rotuloQuantidade }),
      exibirValores ? el('th', { scope: 'col', class: 'is-numeric', text: 'Valor unitário' }) : null,
      exibirValores ? el('th', { scope: 'col', class: 'is-numeric', text: 'Subtotal' }) : null,
      aoRemover ? el('th', { scope: 'col', class: 'is-actions' }, [el('span', { class: 'sr-only', text: 'Ações' })]) : null
    ]);

    const corpo = el('tbody');

    atuais.forEach((item, indice) => {
      const subtotal = item.subtotal ?? calcularSubtotal(item);
      const linha = el('tr', {}, [
        el('td', { text: item.produto || '—' }),
        el('td', {
          class: 'is-numeric',
          text: formatarQuantidade(item.quantidade, { unidade: item.unidade || unidadePadrao })
        }),
        exibirValores ? el('td', { class: 'is-numeric', text: formatarBRL(item.valorUnitario) }) : null,
        exibirValores ? el('td', { class: 'is-numeric', text: formatarBRL(subtotal) }) : null,
        aoRemover
          ? el('td', { class: 'is-actions' }, [
              el('button', {
                type: 'button',
                class: 'icon-btn',
                'aria-label': `Remover ${item.produto || 'item'}`,
                html: icone('excluir'),
                onClick: () => aoRemover(item, indice)
              })
            ])
          : null
      ]);
      corpo.appendChild(linha);
    });

    const totalQuantidade = atuais.reduce((total, item) => total + (paraNumero(item.quantidade) ?? 0), 0);
    const totalValor = atuais.reduce((total, item) => total + (paraNumero(item.subtotal ?? calcularSubtotal(item)) ?? 0), 0);

    const rodape = el('tfoot', {}, [
      el('tr', { class: 'itens-nota__total' }, [
        el('th', { scope: 'row', text: rotuloTotal }),
        el('td', { class: 'is-numeric', text: formatarQuantidade(totalQuantidade, { unidade: unidadePadrao }) }),
        exibirValores ? el('td', {}) : null,
        exibirValores ? el('td', { class: 'is-numeric', text: formatarBRL(totalValor) }) : null,
        aoRemover ? el('td', {}) : null
      ])
    ]);

    elemento.appendChild(
      el('div', { class: 'table-wrapper' }, [
        el('table', { class: 'table itens-nota__tabela' }, [el('thead', {}, cabecalho), corpo, rodape])
      ])
    );
  }

  function atualizar(novosItens) {
    atuais = novosItens || [];
    renderizar();
  }

  renderizar();

  return { elemento, atualizar };
}

function calcularSubtotal(item) {
  const quantidade = paraNumero(item.quantidade);
  const valorUnitario = paraNumero(item.valorUnitario);
  if (quantidade === null || valorUnitario === null) return null;
  return Number((quantidade * valorUnitario).toFixed(2));
}
