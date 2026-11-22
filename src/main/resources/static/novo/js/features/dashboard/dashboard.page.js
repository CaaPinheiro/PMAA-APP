import { el } from '../../shared/utils/dom.js';
import { criarPageHeader } from '../../layout/page-header.js';

/**
 * Estado temporario do Dashboard: a estrutura e os indicadores dependem do
 * contrato ampliado do backend (Fase 6). Nenhum dado ficticio e exibido.
 */
export function renderizarDashboard() {
  return el('div', {}, [
    criarPageHeader({
      titulo: 'Dashboard',
      descricao: 'Visão geral do programa no período selecionado.'
    }),
    el('section', { class: 'card' }, [
      el('div', { class: 'empty-state' }, [
        el('p', { class: 'empty-state__title', text: 'Indicadores indisponíveis' }),
        el('p', { text: 'Os dados do painel serão exibidos quando o contrato do backend estiver disponível.' })
      ])
    ])
  ]);
}
