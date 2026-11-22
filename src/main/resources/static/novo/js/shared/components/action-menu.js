import { el } from '../utils/dom.js';
import { icone } from '../../layout/icons.js';

/** Menu atualmente aberto: garante um único menu contextual por vez. */
let menuAberto = null;

/** Fecha qualquer menu contextual aberto (usado antes de re-renderizar tabelas). */
export function fecharMenusAbertos() {
  if (menuAberto) menuAberto();
}

/**
 * Menu contextual de ações de uma linha de tabela.
 *
 * Ações destrutivas recebem `perigo: true`. O menu controla abertura por teclado,
 * navegação com setas, `Escape` com retorno de foco e fechamento por clique
 * externo.
 *
 * @param {{
 *   acoes: Array<{ rotulo: string, icone?: string|null, perigo?: boolean, aoAcionar: () => void }>,
 *   rotulo?: string
 * }} opcoes
 */
export function criarActionMenu({ acoes = [], rotulo = 'Ações' }) {
  const id = `menu-${Math.random().toString(36).slice(2, 9)}`;
  let menu = null;
  let aberto = false;

  const fecharEste = (opcoes) => fechar(opcoes);

  const gatilho = el('button', {
    type: 'button',
    class: 'icon-btn action-menu__gatilho',
    'aria-label': rotulo,
    'aria-haspopup': 'menu',
    'aria-expanded': 'false',
    'aria-controls': id,
    html: icone('mais-acoes')
  });

  function posicionar() {
    if (!menu) return;

    const referencia = gatilho.getBoundingClientRect();
    const altura = menu.offsetHeight;
    const largura = menu.offsetWidth;
    const margem = 8;

    const abaixoCabe = referencia.bottom + margem + altura <= window.innerHeight;
    const topo = abaixoCabe ? referencia.bottom + margem : Math.max(margem, referencia.top - margem - altura);
    const esquerda = Math.max(margem, Math.min(window.innerWidth - largura - margem, referencia.right - largura));

    menu.style.top = `${topo}px`;
    menu.style.left = `${esquerda}px`;
  }

  function itens() {
    return menu ? Array.from(menu.querySelectorAll('[role="menuitem"]')) : [];
  }

  function focar(indice) {
    const lista = itens();
    if (lista.length === 0) return;
    const alvo = lista[(indice + lista.length) % lista.length];
    alvo.focus();
  }

  function fechar({ devolverFoco = false } = {}) {
    if (!aberto || !menu) return;
    aberto = false;
    gatilho.setAttribute('aria-expanded', 'false');
    menu.remove();
    menu = null;
    document.removeEventListener('pointerdown', aoClicarFora, true);
    window.removeEventListener('resize', fechar);
    window.removeEventListener('scroll', fechar, true);
    if (menuAberto === fecharEste) menuAberto = null;
    if (devolverFoco) gatilho.focus();
  }

  function aoClicarFora(evento) {
    if (!menu) return;
    if (menu.contains(evento.target) || gatilho.contains(evento.target)) return;
    fechar();
  }

  function abrir({ focarPrimeiro = false } = {}) {
    if (aberto) return;
    if (menuAberto && menuAberto !== fecharEste) menuAberto();
    aberto = true;

    menu = el('div', { class: 'menu action-menu__popup', id, role: 'menu', 'aria-label': rotulo });

    acoes.forEach((acao) => {
      menu.appendChild(
        el(
          'button',
          {
            type: 'button',
            class: `menu__item${acao.perigo ? ' menu__item--perigo' : ''}`,
            role: 'menuitem',
            onClick: () => {
              fechar({ devolverFoco: true });
              acao.aoAcionar();
            }
          },
          [
            acao.icone
              ? el('span', { class: 'icone icone--sm menu__icone', html: icone(acao.icone), 'aria-hidden': 'true' })
              : null,
            el('span', { text: acao.rotulo })
          ]
        )
      );
    });

    menu.addEventListener('keydown', (evento) => {
      const lista = itens();
      const indice = lista.indexOf(document.activeElement);

      if (evento.key === 'ArrowDown') {
        evento.preventDefault();
        focar(indice + 1);
      } else if (evento.key === 'ArrowUp') {
        evento.preventDefault();
        focar(indice - 1);
      } else if (evento.key === 'Home') {
        evento.preventDefault();
        focar(0);
      } else if (evento.key === 'End') {
        evento.preventDefault();
        focar(lista.length - 1);
      } else if (evento.key === 'Escape') {
        evento.preventDefault();
        evento.stopPropagation();
        fechar({ devolverFoco: true });
      } else if (evento.key === 'Tab') {
        fechar();
      }
    });

    document.body.appendChild(menu);
    posicionar();

    menuAberto = fecharEste;
    gatilho.setAttribute('aria-expanded', 'true');
    document.addEventListener('pointerdown', aoClicarFora, true);
    window.addEventListener('resize', fechar);
    window.addEventListener('scroll', fechar, true);

    if (focarPrimeiro) focar(0);
  }

  gatilho.addEventListener('click', (evento) => {
    if (aberto) {
      fechar();
      return;
    }
    abrir({ focarPrimeiro: evento.detail === 0 });
  });

  gatilho.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      aberto ? focar(0) : abrir({ focarPrimeiro: true });
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      aberto ? focar(itens().length - 1) : abrir({ focarPrimeiro: true });
    } else if (evento.key === 'Escape' && aberto) {
      evento.preventDefault();
      fechar();
    }
  });

  return {
    elemento: gatilho,
    fechar
  };
}
