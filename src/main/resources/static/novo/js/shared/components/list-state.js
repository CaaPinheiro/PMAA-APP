import { el } from '../utils/dom.js';

/**
 * Estados de uma listagem ou seção de conteúdo.
 *
 * @typedef {'carregando'|'vazio'|'erro'} EstadoLista
 *
 * @param {{
 *   estado: EstadoLista,
 *   mensagem: string,
 *   detalhe?: string|null,
 *   aoTentarNovamente?: (() => void)|null,
 *   rotuloTentarNovamente?: string
 * }} opcoes
 */
export function criarListState({
  estado,
  mensagem,
  detalhe = null,
  aoTentarNovamente = null,
  rotuloTentarNovamente = 'Tentar novamente'
}) {
  const container = el('div', { class: `list-state list-state--${estado}` });

  if (estado === 'carregando') {
    container.setAttribute('role', 'status');
    container.appendChild(el('span', { class: 'spinner', 'aria-hidden': 'true' }));
  } else if (estado === 'erro') {
    container.setAttribute('role', 'alert');
  } else {
    container.setAttribute('role', 'status');
  }

  container.appendChild(el('p', { class: 'list-state__mensagem', text: mensagem }));

  if (detalhe) {
    container.appendChild(el('p', { class: 'list-state__detalhe', text: detalhe }));
  }

  if (estado === 'erro' && aoTentarNovamente) {
    container.appendChild(
      el('button', {
        type: 'button',
        class: 'btn btn--secondary btn--sm list-state__acao',
        text: rotuloTentarNovamente,
        onClick: aoTentarNovamente
      })
    );
  }

  return container;
}
