/**
 * Ícones de linha (SVG estático, controlado pela aplicação).
 * O Angular usa Material Symbols Outlined via CDN; para manter o sistema
 * funcional na rede local, aqui os ícones são embutidos. A biblioteca
 * definitiva continua pendente de decisão (ver docs/design-system.md §10).
 */
const ATRIBUTOS_TRAZO = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

const ICONES = {
  dashboard: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  recebimentos: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M3 13l3-8h12l3 8v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 13h5l2 3h4l2-3h5"/></svg>`,
  entregas: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M4 9h16l-1.6 10.2a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8z"/><path d="M9 9l3-6 3 6"/></svg>`,
  agricultores: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`,
  produtos: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M20 4C10 4 4 10 4 20c10 0 16-6 16-16z"/><path d="M4 20 14 10"/></svg>`,
  beneficiarios: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M3 21h18"/><path d="M12 3 3 8h18z"/><path d="M6 21V11"/><path d="M10 21V11"/><path d="M14 21V11"/><path d="M18 21V11"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>`,
  recolher: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M11 17l-5-5 5-5"/><path d="M18 17l-5-5 5-5"/></svg>`,
  expandir: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M13 7l5 5-5 5"/><path d="M6 7l5 5-5 5"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M6 9l6 6 6-6"/></svg>`,
  sair: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>`,
  fechar: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M6 6l12 12"/><path d="M18 6 6 18"/></svg>`,
  buscar: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
  filtrar: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg>`,
  'mais-acoes': `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>`,
  aviso: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M12 3 2 21h20z"/><path d="M12 10v5"/><path d="M12 18h.01"/></svg>`,
  anterior: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M15 6l-6 6 6 6"/></svg>`,
  proxima: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M9 6l6 6-6 6"/></svg>`,
  ordenar: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M8 9l4-4 4 4"/><path d="M16 15l-4 4-4-4"/></svg>`,
  'ordenar-asc': `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></svg>`,
  'ordenar-desc': `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M12 5v14"/><path d="m6 13 6 6 6-6"/></svg>`,
  editar: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M4 20h4l10-10-4-4L4 16z"/><path d="m14 6 4 4"/></svg>`,
  excluir: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg>`,
  imprimir: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M7 9V3h10v6"/><path d="M7 18H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/></svg>`,
  visualizar: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>`
};

export function icone(nome) {
  return ICONES[nome] || '';
}
