import { el, limpar } from '../utils/dom.js';
import { icone } from '../../layout/icons.js';

/**
 * @typedef {{
 *   nome: string,
 *   rotulo: string,
 *   tipo?: 'select'|'texto'|'data',
 *   opcoes?: Array<{ valor: string, rotulo: string }>,
 *   valor?: string,
 *   placeholder?: string
 * }} CampoFiltro
 */

/**
 * Barra de filtros com aplicar/limpar e indicação de filtros ativos.
 * Visualmente secundária em relação à ação principal da página.
 *
 * @param {{
 *   campos: CampoFiltro[],
 *   aoAplicar: (filtros: Record<string, string>) => void,
 *   aoLimpar?: (() => void)|null,
 *   rotuloAplicar?: string,
 *   rotuloLimpar?: string,
 *   rotulo?: string
 * }} opcoes
 */
export function criarFilterBar({
  campos = [],
  aoAplicar,
  aoLimpar = null,
  rotuloAplicar = 'Aplicar filtros',
  rotuloLimpar = 'Limpar',
  rotulo = 'Filtros'
}) {
  const controles = new Map();

  const linha = el('div', { class: 'filter-bar__campos' });

  campos.forEach((campo) => {
    const id = `filtro-${campo.nome}`;
    const controle = criarControle(campo, id);
    controles.set(campo.nome, controle);

    linha.appendChild(
      el('div', { class: 'field filter-bar__campo' }, [
        el('label', { class: 'field__label', for: id, text: campo.rotulo }),
        controle
      ])
    );
  });

  const form = el('form', { class: 'filter-bar', role: 'search', novalidate: true }, [
    el('h2', { class: 'sr-only', text: rotulo }),
    linha,
    el('div', { class: 'filter-bar__acoes' }, [
      el('button', { type: 'submit', class: 'btn btn--secondary btn--sm', text: rotuloAplicar }),
      el('button', {
        type: 'button',
        class: 'btn btn--ghost btn--sm filter-bar__limpar',
        text: rotuloLimpar,
        onClick: () => {
          limparFiltros();
          if (aoLimpar) aoLimpar();
          aoAplicar(valores());
        }
      })
    ])
  ]);

  const ativos = el('div', { class: 'filter-bar__ativos', hidden: true });
  const container = el('div', { class: 'filter-bar__container' }, [form, ativos]);

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    aoAplicar(valores());
  });

  function valores() {
    const resultado = {};
    for (const [nome, controle] of controles) {
      resultado[nome] = controle.value.trim();
    }
    return resultado;
  }

  function limparFiltros() {
    for (const controle of controles.values()) {
      controle.value = '';
    }
    definirAtivos([]);
  }

  /**
   * Exibe os filtros aplicados. Cada item recebe `aoRemover` para que a feature
   * limpe o campo correspondente e recarregue a lista.
   *
   * @param {Array<{ rotulo: string, aoRemover?: () => void }>} lista
   */
  function definirAtivos(lista = []) {
    limpar(ativos);

    if (lista.length === 0) {
      ativos.hidden = true;
      return;
    }

    ativos.hidden = false;
    ativos.appendChild(el('span', { class: 'filter-bar__ativos-rotulo', text: 'Filtros ativos:' }));

    lista.forEach((item) => {
      ativos.appendChild(
        el('span', { class: 'filter-bar__chip' }, [
          el('span', { text: item.rotulo }),
          el('button', {
            type: 'button',
            class: 'filter-bar__chip-remover',
            'aria-label': `Remover filtro ${item.rotulo}`,
            html: icone('fechar'),
            onClick: () => {
              if (item.aoRemover) item.aoRemover();
            }
          })
        ])
      );
    });
  }

  return {
    elemento: container,
    valores,
    definirAtivos,
    limpar: limparFiltros
  };
}

function criarControle(campo, id) {
  if (campo.tipo === 'select') {
    const select = el('select', { id, class: 'field__control' });
    select.appendChild(el('option', { value: '', text: campo.placeholder || 'Todos' }));
    (campo.opcoes || []).forEach((opcao) => {
      select.appendChild(el('option', { value: opcao.valor, text: opcao.rotulo }));
    });
    select.value = campo.valor || '';
    return select;
  }

  return el('input', {
    id,
    class: 'field__control',
    type: campo.tipo === 'data' ? 'date' : 'text',
    placeholder: campo.placeholder || '',
    value: campo.valor || ''
  });
}
