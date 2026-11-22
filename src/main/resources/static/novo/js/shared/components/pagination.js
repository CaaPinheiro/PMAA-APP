import { el, limpar } from '../utils/dom.js';
import { icone } from '../../layout/icons.js';

/**
 * Paginação processada pelo backend: o componente apenas exibe o estado
 * retornado e informa a página desejada.
 *
 * @param {{
 *   pagina?: number,
 *   totalPaginas?: number,
 *   totalElementos?: number,
 *   tamanho?: number,
 *   aoMudar: (pagina: number) => void
 * }} opcoes
 */
export function criarPagination({
  pagina = 0,
  totalPaginas = 0,
  totalElementos = 0,
  tamanho = 20,
  aoMudar
}) {
  const elemento = el('nav', { class: 'pagination', 'aria-label': 'Paginação' });

  function renderizar(estado) {
    limpar(elemento);

    const total = Math.max(0, estado.totalPaginas || 0);
    const atual = Math.max(0, Math.min(estado.pagina || 0, Math.max(total - 1, 0)));

    elemento.appendChild(
      el('p', {
        class: 'pagination__resumo',
        text: resumo(estado.totalElementos, atual, total, estado.tamanho)
      })
    );

    if (total <= 1) return;

    const anterior = el('button', {
      type: 'button',
      class: 'icon-btn pagination__botao',
      'aria-label': 'Página anterior',
      disabled: atual === 0,
      html: icone('anterior'),
      onClick: () => aoMudar(atual - 1)
    });

    const proxima = el('button', {
      type: 'button',
      class: 'icon-btn pagination__botao',
      'aria-label': 'Próxima página',
      disabled: atual >= total - 1,
      html: icone('proxima'),
      onClick: () => aoMudar(atual + 1)
    });

    elemento.appendChild(
      el('div', { class: 'pagination__controles' }, [
        anterior,
        el('span', { class: 'pagination__posicao', text: `Página ${atual + 1} de ${total}` }),
        proxima
      ])
    );
  }

  renderizar({ pagina, totalPaginas, totalElementos, tamanho });

  return {
    elemento,
    atualizar: (estado) => renderizar({ pagina, totalPaginas, totalElementos, tamanho, ...estado })
  };
}

function resumo(totalElementos, pagina, totalPaginas, tamanho) {
  const total = Number(totalElementos);
  if (!Number.isFinite(total) || total <= 0) return 'Nenhum registro';

  const inicio = pagina * tamanho + 1;
  const fim = Math.min(total, (pagina + 1) * tamanho);
  const sufixo = total === 1 ? 'registro' : 'registros';

  if (totalPaginas <= 1) return `${total} ${sufixo}`;
  return `Exibindo ${inicio}–${fim} de ${total} ${sufixo}`;
}
