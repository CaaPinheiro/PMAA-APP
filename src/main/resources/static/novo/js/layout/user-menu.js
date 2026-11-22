import { el } from '../shared/utils/dom.js';
import { roleLabel } from '../core/permissions.js';
import { icone } from './icons.js';

/**
 * Menu do usuário no rodapé da sidebar.
 * Fecha com Escape ou clique fora; devolve o foco ao gatilho quando fechado
 * por teclado.
 *
 * @param {{ aoSair: () => void }} acoes
 */
export function criarMenuUsuario({ aoSair }) {
  const nome = el('span', { class: 'user-menu__name' });
  const papel = el('span', { class: 'user-menu__role' });
  const avatar = el('span', { class: 'user-menu__avatar', 'aria-hidden': 'true', text: '?' });

  const itemSair = el(
    'button',
    {
      type: 'button',
      class: 'user-menu__item',
      role: 'menuitem',
      onclick: () => {
        fechar({ devolverFoco: false });
        aoSair();
      }
    },
    [
      el('span', { class: 'icone icone--sm', html: icone('sair') }),
      el('span', { text: 'Sair' })
    ]
  );

  const painel = el('div', { class: 'user-menu__panel', role: 'menu', id: 'user-menu-panel', hidden: true }, [itemSair]);

  const gatilho = el(
    'button',
    {
      type: 'button',
      class: 'user-menu__trigger',
      'aria-haspopup': 'menu',
      'aria-expanded': 'false',
      'aria-controls': 'user-menu-panel',
      onclick: () => (aberto ? fechar({ devolverFoco: false }) : abrir())
    },
    [
      avatar,
      el('span', { class: 'user-menu__info' }, [nome, papel]),
      el('span', { class: 'icone icone--sm user-menu__chevron', html: icone('chevron') })
    ]
  );

  const elemento = el('div', { class: 'user-menu' }, [gatilho, painel]);

  let aberto = false;

  function definirAberto(valor) {
    aberto = valor;
    painel.hidden = !valor;
    gatilho.setAttribute('aria-expanded', String(valor));
  }

  function abrir() {
    definirAberto(true);
    itemSair.focus();
  }

  function fechar({ devolverFoco = true } = {}) {
    if (!aberto) return;
    definirAberto(false);
    if (devolverFoco) gatilho.focus();
  }

  gatilho.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      abrir();
    }
  });

  painel.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      fechar();
    }
  });

  document.addEventListener('mousedown', (evento) => {
    if (aberto && !elemento.contains(evento.target)) {
      definirAberto(false);
    }
  });

  function definirUsuario(usuario) {
    const texto = (usuario && usuario.nome) || 'Usuário';
    const perfil = roleLabel(usuario);

    nome.textContent = texto;
    papel.textContent = perfil;
    avatar.textContent = texto.trim().charAt(0) || '?';
    gatilho.title = texto + ' — ' + perfil;
  }

  return { elemento, definirUsuario, fechar };
}
