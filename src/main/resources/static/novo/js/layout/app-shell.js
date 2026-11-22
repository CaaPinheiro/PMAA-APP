import { el, substituirConteudo } from '../shared/utils/dom.js';
import { criarSidebar } from './sidebar.js';
import { icone } from './icons.js';

const CONSULTA_MOBILE = '(max-width: 767px)';

/**
 * Shell persistente: sidebar (fixa no desktop, sobreposta no mobile) e área
 * de conteúdo. O estado de recolhimento fica aqui; a sidebar apenas reflete.
 */
export function criarAppShell({ aoSair }) {
  let recolhida = false;

  const sidebar = criarSidebar({ aoSair, aoAlternarRecolhimento: alternarRecolhimento });

  const menuTrigger = el('button', {
    type: 'button',
    class: 'app-shell__menu-trigger',
    'aria-label': 'Abrir navegação principal',
    'aria-expanded': 'false',
    'aria-controls': 'sidebar-navegacao'
  });
  menuTrigger.innerHTML = icone('menu');

  const backdrop = el('button', {
    type: 'button',
    class: 'app-shell__backdrop',
    'aria-label': 'Fechar navegação',
    hidden: true
  });

  const outlet = el('div', { class: 'app-shell__outlet' });
  const main = el('main', { class: 'app-shell__main', id: 'main-content', tabindex: '-1' }, outlet);
  const conteudo = el('div', { class: 'app-shell__content' }, [
    el('div', { class: 'app-shell__topbar' }, menuTrigger),
    main
  ]);

  const elemento = el(
    'div',
    { class: 'app-shell', 'data-collapsed': 'false', 'data-nav-open': 'false' },
    [
      el('a', { class: 'skip-link', href: '#main-content', text: 'Ir para o conteúdo' }),
      sidebar.elemento,
      backdrop,
      conteudo
    ]
  );

  const consultaMobile = window.matchMedia(CONSULTA_MOBILE);

  function definirNavAberta(aberta, { devolverFoco = false } = {}) {
    const valor = Boolean(aberta) && consultaMobile.matches;

    elemento.dataset.navOpen = String(valor);
    backdrop.hidden = !valor;
    menuTrigger.setAttribute('aria-expanded', String(valor));
    document.body.classList.toggle('is-nav-open', valor);

    if (valor) {
      sidebar.fecharMenuUsuario();
      const alvo = sidebar.elemento.querySelector('[aria-current="page"]') || sidebar.elemento.querySelector('.sidebar__item');
      if (alvo) alvo.focus();
    } else if (devolverFoco) {
      menuTrigger.focus();
    }
  }

  function alternarNav() {
    definirNavAberta(elemento.dataset.navOpen !== 'true');
  }

  function alternarRecolhimento() {
    if (consultaMobile.matches) return;

    recolhida = !recolhida;
    elemento.dataset.collapsed = String(recolhida);
    sidebar.definirRecolhida(recolhida);
  }

  menuTrigger.addEventListener('click', alternarNav);
  backdrop.addEventListener('click', () => definirNavAberta(false, { devolverFoco: true }));

  consultaMobile.addEventListener('change', (evento) => {
    if (!evento.matches) definirNavAberta(false);
  });

  elemento.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && elemento.dataset.navOpen === 'true') {
      evento.stopPropagation();
      definirNavAberta(false, { devolverFoco: true });
    }
  });

  function definirConteudo(node) {
    substituirConteudo(outlet, node);
  }

  function definirAtivo(caminho) {
    sidebar.definirAtivo(caminho);
    sidebar.fecharMenuUsuario();
    definirNavAberta(false);
  }

  function sairDaTela() {
    sidebar.fecharMenuUsuario();
    definirNavAberta(false);
  }

  return {
    elemento,
    definirConteudo,
    definirAtivo,
    definirUsuario: sidebar.definirUsuario,
    sairDaTela
  };
}
