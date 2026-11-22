import { el, substituirConteudo } from '../utils/dom.js';
import { icone } from '../../layout/icons.js';

/**
 * Diálogo modal do Design System.
 *
 * Responsabilidades do componente: superfície, cabeçalho, rodapé de ações,
 * armadilha de foco, retorno de foco ao fechar, bloqueio de rolagem, estado de
 * processamento e mensagem de erro. O conteúdo e as ações pertencem à feature.
 *
 * @typedef {{
 *   rotulo: string,
 *   variante?: 'primaria'|'secundaria'|'perigo',
 *   aoAcionar?: (contexto: ContextoModal) => unknown,
 *   fecharAoAcionar?: boolean
 * }} AcaoModal
 *
 * @typedef {{
 *   fechar: () => void,
 *   definirProcessando: (ativo: boolean, rotulo?: string) => void,
 *   mostrarErro: (mensagem: string) => void,
 *   limparErro: () => void,
 *   elemento: HTMLElement
 * }} ContextoModal
 */

let modaisAbertos = 0;

/**
 * @param {{
 *   titulo: string,
 *   descricao?: string|null,
 *   conteudo?: Node|Node[]|null,
 *   acoes?: AcaoModal[],
 *   largura?: 'padrao'|'larga',
 *   rotuloFechar?: string,
 *   aoFechar?: (() => void)|null
 * }} opcoes
 * @returns {ContextoModal}
 */
export function abrirModal({
  titulo,
  descricao = null,
  conteudo = null,
  acoes = [],
  largura = 'padrao',
  rotuloFechar = 'Fechar',
  aoFechar = null
}) {
  const idTitulo = `modal-titulo-${Math.random().toString(36).slice(2, 9)}`;
  const idDescricao = descricao ? `modal-descricao-${Math.random().toString(36).slice(2, 9)}` : null;

  const focoAnterior = document.activeElement;
  let processando = false;
  let fechado = false;
  const aoFecharInterno = aoFechar;

  const contexto = {};

  const botaoFechar = el('button', {
    type: 'button',
    class: 'icon-btn modal__fechar',
    'aria-label': rotuloFechar,
    html: icone('fechar'),
    onClick: () => fechar()
  });

  const corpo = el('div', { class: 'modal__corpo' }, conteudo);

  const erro = el('p', { class: 'modal__erro', role: 'alert', hidden: true });

  const rodape = el('footer', { class: 'modal__rodape' });
  const botoesAcao = [];

  acoes.forEach((acao) => {
    const botao = el('button', {
      type: 'button',
      class: `btn ${classeDaVariante(acao.variante)}`,
      text: acao.rotulo,
      onClick: () => executarAcao(acao, botao)
    });
    botao.dataset.rotuloOriginal = acao.rotulo;
    botoesAcao.push(botao);
    rodape.appendChild(botao);
  });

  const dialogo = el(
    'div',
    {
      class: `modal modal--${largura}`,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': idTitulo,
      'aria-describedby': idDescricao
    },
    [
      el('header', { class: 'modal__cabecalho' }, [
        el('div', { class: 'modal__titulos' }, [
          el('h2', { class: 'modal__titulo', id: idTitulo, text: titulo }),
          descricao ? el('p', { class: 'modal__descricao', id: idDescricao, text: descricao }) : null
        ]),
        botaoFechar
      ]),
      corpo,
      erro,
      acoes.length > 0 ? rodape : null
    ]
  );

  const backdrop = el('div', { class: 'modal-backdrop' }, dialogo);

  async function executarAcao(acao, botao) {
    if (processando || !acao.aoAcionar) return;

    let resultado;
    try {
      resultado = await acao.aoAcionar(contexto);
    } catch (erroAcao) {
      console.error('Falha ao executar ação do modal', erroAcao);
      mostrarErro('Não foi possível concluir a operação. Tente novamente.');
      return;
    }

    if (resultado === false) return;
    if (acao.fecharAoAcionar !== false) fechar();
    botao.blur();
  }

  function fechar() {
    if (fechado) return;
    fechado = true;

    document.removeEventListener('keydown', aoTeclar, true);
    backdrop.remove();

    modaisAbertos = Math.max(0, modaisAbertos - 1);
    if (modaisAbertos === 0) document.body.classList.remove('is-modal-open');

    if (focoAnterior instanceof HTMLElement && focoAnterior.isConnected) {
      focoAnterior.focus();
    }

    if (aoFecharInterno) aoFecharInterno();
  }

  function focarPrimeiro() {
    const preferido = dialogo.querySelector('[data-autofocus]');
    if (preferido) {
      preferido.focus();
      return;
    }

    const campo = dialogo.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled])');
    if (campo) {
      campo.focus();
      return;
    }

    const botao = dialogo.querySelector('.modal__rodape .btn') || botaoFechar;
    botao.focus();
  }

  function aoTeclar(evento) {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      evento.stopPropagation();
      if (!processando) fechar();
      return;
    }

    if (evento.key !== 'Tab') return;

    const focaveis = Array.from(
      dialogo.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((elemento) => elemento.offsetParent !== null);

    if (focaveis.length === 0) {
      evento.preventDefault();
      return;
    }

    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];

    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  }

  function definirProcessando(ativo, rotuloProcessando = 'Processando...') {
    processando = Boolean(ativo);
    dialogo.setAttribute('aria-busy', processando ? 'true' : 'false');

    botaoFechar.disabled = processando;

    botoesAcao.forEach((botao) => {
      botao.disabled = processando;
      if (processando) {
        botao.textContent = rotuloProcessando;
      } else {
        botao.textContent = botao.dataset.rotuloOriginal;
      }
    });
  }

  function mostrarErro(mensagem) {
    erro.textContent = mensagem;
    erro.hidden = false;
  }

  function limparErro() {
    erro.hidden = true;
    erro.textContent = '';
  }

  Object.assign(contexto, {
    elemento: backdrop,
    fechar,
    definirProcessando,
    mostrarErro,
    limparErro
  });

  backdrop.addEventListener('pointerdown', (evento) => {
    if (evento.target === backdrop && !processando) fechar();
  });

  document.body.appendChild(backdrop);
  modaisAbertos += 1;
  document.body.classList.add('is-modal-open');
  document.addEventListener('keydown', aoTeclar, true);
  focarPrimeiro();

  return contexto;
}

function classeDaVariante(variante) {
  if (variante === 'primaria') return 'btn--primary';
  if (variante === 'perigo') return 'btn--danger';
  return 'btn--secondary';
}

/**
 * Facilita atualizar o conteúdo de um modal já aberto (ex.: recarregar seções).
 *
 * @param {ContextoModal} contexto
 * @param {Node|Node[]|null} conteudo
 */
export function atualizarConteudoModal(contexto, conteudo) {
  const corpo = contexto.elemento.querySelector('.modal__corpo');
  if (corpo) substituirConteudo(corpo, conteudo);
}
