import { el } from '../utils/dom.js';
import { formatarBRL } from '../utils/money.js';
import { formatarNumero, formatarQuantidade } from '../utils/formatters.js';

/**
 * Card de indicador do Dashboard.
 *
 * `valor === null` (informação ainda não fornecida pelo backend) é exibido como
 * `—`; `0` é um dado real e é exibido como zero. Os demais cards da tela não
 * dependem deste.
 *
 * @param {{
 *   rotulo: string,
 *   valor: number|string|null|undefined,
 *   descricao?: string|null,
 *   destaque?: boolean,
 *   formato?: 'texto'|'moeda'|'numero'|'quantidade',
 *   unidade?: string
 * }} opcoes
 */
export function criarIndicatorCard({
  rotulo,
  valor,
  descricao = null,
  destaque = false,
  formato = 'texto',
  unidade = ''
}) {
  const vazio = valor === null || valor === undefined || valor === '';
  const texto = vazio ? '—' : formatarValor(valor, formato, unidade);

  const card = el(
    'article',
    {
      class: `indicator-card${destaque ? ' indicator-card--destaque' : ''}`,
      'aria-label': `${rotulo}: ${texto}`
    },
    [
      el('p', { class: 'indicator-card__rotulo', text: rotulo }),
      el('p', {
        class: `indicator-card__valor${vazio ? ' indicator-card__valor--vazio' : ''}`,
        text: texto
      }),
      descricao ? el('p', { class: 'indicator-card__descricao', text: descricao }) : null
    ]
  );

  return card;
}

function formatarValor(valor, formato, unidade) {
  if (formato === 'moeda') return formatarBRL(valor);
  if (formato === 'numero') return formatarNumero(valor);
  if (formato === 'quantidade') return formatarQuantidade(valor, { unidade });
  return String(valor);
}
