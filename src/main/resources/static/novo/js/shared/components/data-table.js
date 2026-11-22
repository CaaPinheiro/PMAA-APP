import { el, limpar } from '../utils/dom.js';
import { icone } from '../../layout/icons.js';
import { textoOuTraco } from '../utils/formatters.js';
import { fecharMenusAbertos } from './action-menu.js';
import { criarListState } from './list-state.js';

/**
 * @typedef {{
 *   chave: string,
 *   rotulo: string,
 *   alinhamento?: 'inicio'|'fim',
 *   ordenavel?: boolean,
 *   formatar?: (linha: Record<string, unknown>) => string|Node|null,
 *   classe?: string
 * }} ColunaTabela
 */

/**
 * Tabela configurável: colunas, linhas, ordenação, coluna de ações e estados.
 * Não conhece domínio, service nem regra de negócio — a feature informa colunas,
 * formatação e ações.
 *
 * Ordenação e paginação são responsabilidade do backend: o componente apenas
 * reflete o estado recebido e comunica a coluna escolhida.
 *
 * @param {{
 *   colunas: ColunaTabela[],
 *   linhas?: Array<Record<string, unknown>>,
 *   vazio?: string,
 *   detalheVazio?: string|null,
 *   larguraMinima?: number|null,
 *   ordenacao?: { campo: string, direcao: 'asc'|'desc' }|null,
 *   aoOrdenar?: ((campo: string) => void)|null,
 *   acoes?: ((linha: Record<string, unknown>, indice: number) => Node[])|null,
 *   rotuloAcoes?: string,
 *   carregando?: boolean,
 *   rotuloCarregando?: string
 * }} config
 */
export function criarDataTable(config) {
  let estado = {
    linhas: [],
    vazio: 'Nenhum registro encontrado.',
    detalheVazio: null,
    larguraMinima: null,
    ordenacao: null,
    aoOrdenar: null,
    acoes: null,
    rotuloAcoes: 'Ações',
    carregando: false,
    rotuloCarregando: 'Carregando registros...',
    ...config
  };

  const thead = el('thead');
  const tbody = el('tbody');
  const tabela = el('table', { class: 'table' }, [thead, tbody]);
  const wrapper = el('div', { class: 'table-wrapper' }, tabela);
  const elemento = el('div', { class: 'data-table' }, wrapper);

  function renderizarCabecalho() {
    limpar(thead);

    const linha = el('tr');
    estado.colunas.forEach((coluna) => {
      const th = el('th', { scope: 'col', class: coluna.classe || null });
      if (coluna.alinhamento === 'fim') th.classList.add('is-numeric');

      if (coluna.ordenavel && estado.aoOrdenar) {
        const ordenacao = estado.ordenacao;
        const ativa = ordenacao && ordenacao.campo === coluna.chave;
        th.setAttribute('aria-sort', ativa ? (ordenacao.direcao === 'desc' ? 'descending' : 'ascending') : 'none');

        const botao = el(
          'button',
          {
            type: 'button',
            class: `table__ordenar${ativa ? ' table__ordenar--ativa' : ''}`,
            onClick: () => estado.aoOrdenar(coluna.chave)
          },
          [
            el('span', { text: coluna.rotulo }),
            el('span', {
              class: 'icone icone--sm table__ordenar-icone',
              html: icone(ativa ? (ordenacao.direcao === 'desc' ? 'ordenar-desc' : 'ordenar-asc') : 'ordenar'),
              'aria-hidden': 'true'
            })
          ]
        );
        th.appendChild(botao);
      } else {
        th.textContent = coluna.rotulo;
      }

      linha.appendChild(th);
    });

    if (estado.acoes) {
      linha.appendChild(
        el('th', { scope: 'col', class: 'is-actions' }, [el('span', { class: 'sr-only', text: estado.rotuloAcoes })])
      );
    }

    thead.appendChild(linha);
  }

  function celulaVazia(mensagem) {
    const colunas = estado.colunas.length + (estado.acoes ? 1 : 0);
    const conteudo =
      typeof mensagem === 'string'
        ? criarListState({ estado: 'vazio', mensagem, detalhe: estado.detalheVazio })
        : mensagem;

    return el('tr', {}, [el('td', { class: 'data-table__vazio', colspan: String(colunas) }, conteudo)]);
  }

  function renderizarCorpo() {
    limpar(tbody);

    if (estado.carregando) {
      tbody.appendChild(
        celulaVazia(
          criarListState({ estado: 'carregando', mensagem: estado.rotuloCarregando })
        )
      );
      return;
    }

    if (!estado.linhas || estado.linhas.length === 0) {
      tbody.appendChild(celulaVazia(estado.vazio));
      return;
    }

    estado.linhas.forEach((linha, indice) => {
      const tr = el('tr');

      estado.colunas.forEach((coluna) => {
        const conteudo = coluna.formatar
          ? coluna.formatar(linha)
          : textoOuTraco(linha[coluna.chave]);

        const td = el('td', { class: coluna.classe || null });
        if (coluna.alinhamento === 'fim') td.classList.add('is-numeric');

        if (conteudo instanceof Node) {
          td.appendChild(conteudo);
        } else {
          td.textContent = conteudo === null || conteudo === undefined ? '—' : String(conteudo);
        }

        tr.appendChild(td);
      });

      if (estado.acoes) {
        const acoes = estado.acoes(linha, indice) || [];
        const conteudoAcoes = el('div', { class: 'data-table__acoes-conteudo' });
        acoes.forEach((acao) => {
          if (acao instanceof Node) conteudoAcoes.appendChild(acao);
        });

        const tdAcoes = el('td', { class: 'is-actions data-table__acoes' }, conteudoAcoes);

        tr.appendChild(tdAcoes);
      }

      tbody.appendChild(tr);
    });
  }

  function renderizar() {
    fecharMenusAbertos();
    wrapper.style.minInlineSize = estado.larguraMinima ? `${estado.larguraMinima}px` : '';
    renderizarCabecalho();
    renderizarCorpo();
  }

  /**
   * @param {Partial<typeof estado>} parcial
   */
  function atualizar(parcial = {}) {
    estado = { ...estado, ...parcial };
    renderizar();
  }

  renderizar();

  return { elemento, atualizar };
}
