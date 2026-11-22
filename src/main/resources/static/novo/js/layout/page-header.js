import { el } from '../shared/utils/dom.js';

/**
 * Cabeçalho padrão das páginas: título, descrição e ações à direita.
 * Ações e filtros não aparecem na impressão.
 *
 * @param {{ titulo: string, descricao?: string, acoes?: Node[] }} opcoes
 */
export function criarPageHeader({ titulo, descricao, acoes = [] }) {
  const textos = el('div', { class: 'page-header__text' }, [
    el('h1', { class: 'page-title', text: titulo }),
    descricao ? el('p', { class: 'page-description', text: descricao }) : null
  ]);

  const header = el('header', { class: 'page-header' }, textos);

  if (acoes.length > 0) {
    header.appendChild(el('div', { class: 'page-actions', 'data-print-hidden': '' }, acoes));
  }

  return header;
}
