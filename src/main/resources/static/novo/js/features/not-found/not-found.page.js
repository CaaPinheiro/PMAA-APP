import { el } from '../../shared/utils/dom.js';
import { criarPageHeader } from '../../layout/page-header.js';
import { urlPara } from '../../core/router.js';

export function renderizarNaoEncontrada({ caminho } = {}) {
  return el('div', {}, [
    criarPageHeader({ titulo: 'Página não encontrada' }),
    el('section', { class: 'card' }, [
      el('div', { class: 'empty-state' }, [
        el('p', { class: 'empty-state__title', text: 'Este endereço não existe' }),
        el('p', { text: caminho ? 'O caminho ' + caminho + ' não corresponde a nenhuma tela.' : '' }),
        el('a', { class: 'btn btn--primary', href: urlPara('/dashboard'), 'data-nav': '', text: 'Ir para o início' })
      ])
    ])
  ]);
}
