import { el } from '../shared/utils/dom.js';
import { criarPageHeader } from '../layout/page-header.js';

/**
 * Placeholder para modulos do escopo que ainda serao migrados.
 * Evita links mortos no shell durante a construcao incremental.
 */
export function renderizarEmConstrucao(titulo, descricao) {
  return el('div', {}, [
    criarPageHeader({ titulo, descricao }),
    el('section', { class: 'card' }, [
      el('div', { class: 'empty-state' }, [
        el('p', { class: 'empty-state__title', text: 'Módulo em implementação' }),
        el('p', { text: 'Esta tela será migrada nas próximas fases, preservando o comportamento atual do sistema.' })
      ])
    ])
  ]);
}
