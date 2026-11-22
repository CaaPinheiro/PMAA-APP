import { el } from '../shared/utils/dom.js';
import { urlPara } from '../core/router.js';
import { APP_BASE } from '../core/config.js';
import { icone } from './icons.js';
import { criarMenuUsuario } from './user-menu.js';

/**
 * Navegação do escopo inicial. Módulos fora do escopo (Pagamentos, Relatórios,
 * Funcionários, Saldo do agricultor, Perfil, Configurações) permanecem no
 * frontend legado e não são exibidos aqui.
 *
 * Estrutura e comportamento seguem a sidebar do Angular aprovado como
 * referência: grupos, submenus, estado recolhido e menu de usuário.
 */
const NAVEGACAO_PRINCIPAL = [
  { rotulo: 'Visão geral', caminho: '/dashboard', icone: 'dashboard' },
  {
    rotulo: 'Recebimentos',
    icone: 'recebimentos',
    filhos: [
      { rotulo: 'Notas diárias', caminho: '/recebimentos/notas-diarias' },
      { rotulo: 'Notas mensais', caminho: '/recebimentos/notas-mensais' }
    ]
  },
  {
    rotulo: 'Entregas',
    icone: 'entregas',
    filhos: [
      { rotulo: 'Notas diárias', caminho: '/entregas/notas-diarias' },
      { rotulo: 'Notas mensais', caminho: '/entregas/notas-mensais' }
    ]
  }
];

const NAVEGACAO_CADASTRO = [
  { rotulo: 'Agricultores', caminho: '/agricultores', icone: 'agricultores' },
  { rotulo: 'Produtos', caminho: '/produtos', icone: 'produtos' },
  { rotulo: 'Beneficiários', caminho: '/beneficiarios', icone: 'beneficiarios' }
];

function criarLink(item, classeExtra) {
  const link = el(
    'a',
    {
      class: 'sidebar__item' + (classeExtra ? ' ' + classeExtra : ''),
      href: urlPara(item.caminho),
      'data-nav': '',
      title: item.rotulo
    },
    [
      item.icone ? el('span', { class: 'icone sidebar__icon', html: icone(item.icone) }) : null,
      el('span', { class: 'sidebar__label', text: item.rotulo })
    ]
  );

  return link;
}

/**
 * @param {{ aoSair: () => void, aoAlternarRecolhimento: () => void }} acoes
 */
export function criarSidebar({ aoSair, aoAlternarRecolhimento }) {
  const linksAtivos = [];
  const expansaveis = [];
  const expandidos = new Set();
  let recolhida = false;

  const nav = el('nav', { class: 'sidebar__nav', 'aria-label': 'Navegação principal' });
  const listaPrincipal = el('ul', { class: 'sidebar__list' });

  NAVEGACAO_PRINCIPAL.forEach((item) => {
    if (!item.filhos) {
      const link = criarLink(item);
      linksAtivos.push({ caminho: item.caminho, elemento: link });
      listaPrincipal.appendChild(el('li', {}, link));
      return;
    }

    const submenuId = 'submenu-' + item.rotulo.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-');

    const submenu = el(
      'ul',
      { class: 'sidebar__submenu', id: submenuId, hidden: true },
      item.filhos.map((filho) => {
        const linkFilho = criarLink(filho, 'sidebar__item--submenu');
        linksAtivos.push({ caminho: filho.caminho, elemento: linkFilho });
        return el('li', {}, linkFilho);
      })
    );

    const botao = el(
      'button',
      {
        type: 'button',
        class: 'sidebar__item sidebar__item--expandable',
        'aria-expanded': 'false',
        'aria-controls': submenuId,
        title: item.rotulo
      },
      [
        el('span', { class: 'icone sidebar__icon', html: icone(item.icone) }),
        el('span', { class: 'sidebar__label', text: item.rotulo }),
        el('span', { class: 'icone icone--sm sidebar__chevron', html: icone('chevron') })
      ]
    );

    const container = el('li', { class: 'sidebar__expandable' }, [botao, submenu]);

    const expansivel = { item, botao, submenu, container };

    function aplicarEstado() {
      const aberto = !recolhida && expandidos.has(item.rotulo);
      botao.setAttribute('aria-expanded', String(aberto));
      submenu.hidden = !aberto;

      const rotaFilhaAtiva = item.filhos.some((filho) =>
        linksAtivos.some((registro) => registro.caminho === filho.caminho && registro.ativo)
      );
      container.classList.toggle('sidebar__expandable--active', rotaFilhaAtiva);
    }

    botao.addEventListener('click', () => {
      if (recolhida) return;
      if (expandidos.has(item.rotulo)) {
        expandidos.delete(item.rotulo);
      } else {
        expandidos.add(item.rotulo);
      }
      aplicarEstado();
    });

    expansivel.aplicarEstado = aplicarEstado;
    expansaveis.push(expansivel);
    listaPrincipal.appendChild(container);
  });

  nav.appendChild(listaPrincipal);
  nav.appendChild(el('hr', { class: 'sidebar__divider' }));

  const tituloCadastroId = 'sidebar-grupo-cadastro';
  const listaCadastro = el('ul', { class: 'sidebar__list' });

  NAVEGACAO_CADASTRO.forEach((item) => {
    const link = criarLink(item);
    linksAtivos.push({ caminho: item.caminho, elemento: link });
    listaCadastro.appendChild(el('li', {}, link));
  });

  nav.appendChild(
    el('section', { 'aria-labelledby': tituloCadastroId }, [
      el('h2', { class: 'sidebar__group-title', id: tituloCadastroId, text: 'Cadastro' }),
      listaCadastro
    ])
  );

  const botaoRecolher = el('button', {
    type: 'button',
    class: 'sidebar__collapse',
    'aria-label': 'Recolher menu lateral',
    'aria-expanded': 'true',
    'aria-controls': 'sidebar-navegacao',
    title: 'Recolher menu lateral',
    onclick: aoAlternarRecolhimento
  });
  botaoRecolher.innerHTML = icone('recolher');

  nav.id = 'sidebar-navegacao';

  const marca = el(
    'a',
    { class: 'sidebar__brand', href: urlPara('/dashboard'), 'data-nav': '', 'aria-label': 'Integra PMAA' },
    [
      el('img', {
        src: APP_BASE + '/assets/brand/logotipo-integra-pmaa.svg',
        alt: 'Integra PMAA',
        width: 119,
        height: 24
      })
    ]
  );

  const menuUsuario = criarMenuUsuario({ aoSair });

  const elemento = el('aside', { class: 'sidebar' }, [
    el('div', { class: 'sidebar__top' }, [marca, botaoRecolher]),
    nav,
    el('div', { class: 'sidebar__footer' }, menuUsuario.elemento)
  ]);

  function definirAtivo(caminho) {
    linksAtivos.forEach((registro) => {
      const ativo = registro.caminho === caminho;
      registro.ativo = ativo;
      if (ativo) {
        registro.elemento.setAttribute('aria-current', 'page');
      } else {
        registro.elemento.removeAttribute('aria-current');
      }
    });

    // Abre automaticamente o submenu da rota ativa.
    expansaveis.forEach((expansivel) => {
      const dentro = expansivel.item.filhos.some((filho) => filho.caminho === caminho);
      if (dentro) expandidos.add(expansivel.item.rotulo);
      expansivel.aplicarEstado();
    });
  }

  function definirUsuario(usuario) {
    menuUsuario.definirUsuario(usuario);
  }

  function definirRecolhida(valor) {
    recolhida = valor;
    const rotulo = valor ? 'Expandir menu lateral' : 'Recolher menu lateral';

    botaoRecolher.setAttribute('aria-expanded', String(!valor));
    botaoRecolher.setAttribute('aria-label', rotulo);
    botaoRecolher.title = rotulo;
    botaoRecolher.innerHTML = icone(valor ? 'expandir' : 'recolher');

    expansaveis.forEach((expansivel) => expansivel.aplicarEstado());
  }

  function fecharMenuUsuario() {
    menuUsuario.fechar({ devolverFoco: false });
  }

  return { elemento, definirAtivo, definirUsuario, definirRecolhida, fecharMenuUsuario };
}
