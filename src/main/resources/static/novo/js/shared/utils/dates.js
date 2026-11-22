/**
 * Datas do sistema: o backend trafega `yyyy-MM-dd` (datas) e ISO 8601
 * (data/hora); a interface exibe `dd/MM/yyyy` no padrão brasileiro.
 */

export const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

const TRACO = '—';

/**
 * Converte um valor do backend em `Date`. Datas sem hora são interpretadas no
 * fuso local (evita o deslocamento de um dia causado pelo parse em UTC).
 *
 * @param {string|Date|null|undefined} valor
 * @returns {Date|null}
 */
export function paraData(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return Number.isNaN(valor.getTime()) ? null : valor;

  const texto = String(valor).trim();
  if (!texto) return null;

  const data = /^\d{4}-\d{2}-\d{2}$/.test(texto) ? new Date(texto + 'T00:00:00') : new Date(texto);
  return Number.isNaN(data.getTime()) ? null : data;
}

const formatadorData = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const formatadorDataHora = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

/**
 * @param {string|Date|null|undefined} valor
 * @param {{ vazio?: string }} [opcoes]
 */
export function formatarData(valor, { vazio = TRACO } = {}) {
  const data = paraData(valor);
  return data ? formatadorData.format(data) : vazio;
}

/**
 * @param {string|Date|null|undefined} valor
 * @param {{ vazio?: string }} [opcoes]
 */
export function formatarDataHora(valor, { vazio = TRACO } = {}) {
  const data = paraData(valor);
  return data ? formatadorDataHora.format(data) : vazio;
}

/**
 * Converte em `yyyy-MM-dd`, formato aceito por `input[type=date]` e pelo backend.
 *
 * @param {string|Date|null|undefined} valor
 */
export function paraISO(valor) {
  const data = paraData(valor);
  if (!data) return '';
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

/**
 * @param {number} numero 1 a 12
 */
export function nomeDoMes(numero) {
  return MESES[numero - 1] || '';
}

/** Opções para selects de mês, no formato de `filter-bar`/`select`. */
export function opcoesDeMes() {
  return MESES.map((rotulo, indice) => ({ valor: String(indice + 1), rotulo }));
}

/** @param {number} [quantidade] */
export function anosDisponiveis(quantidade = 6, referencia = new Date().getFullYear()) {
  const anos = [];
  for (let indice = 0; indice < quantidade; indice += 1) {
    anos.push(String(referencia - indice));
  }
  return anos.map((ano) => ({ valor: ano, rotulo: ano }));
}

export function mesAtual() {
  return String(new Date().getMonth() + 1);
}

export function anoAtual() {
  return String(new Date().getFullYear());
}
