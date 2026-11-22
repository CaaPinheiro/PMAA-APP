/**
 * Formatação financeira única da aplicação.
 *
 * Regras (aprovadas): exibir em BRL no formato brasileiro, preservar o valor
 * numérico recebido do backend e nunca transformar "indisponível" (null) em
 * R$ 0,00.
 */
const FORMATADOR_BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const INDISPONIVEL = '—';

/**
 * @param {number|string|null|undefined} valor
 * @returns {string} valor formatado em BRL ou "—" quando indisponível
 */
export function formatarBRL(valor) {
  if (valor === null || valor === undefined || valor === '') return INDISPONIVEL;

  const numero = typeof valor === 'number' ? valor : Number(valor);
  if (!Number.isFinite(numero)) return INDISPONIVEL;

  return FORMATADOR_BRL.format(numero);
}
