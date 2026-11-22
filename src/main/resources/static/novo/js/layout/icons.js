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
  fechar: `<svg viewBox="0 0 24 24" ${ATRIBUTOS_TRAZO}><path d="M6 6l12 12"/><path d="M18 6 6 18"/></svg>`
};

export function icone(nome) {
  return ICONES[nome] || '';
}
