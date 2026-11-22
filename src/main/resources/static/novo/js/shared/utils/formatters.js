/**
 * Formatadores de apresentação. Valores vindos do backend são preservados como
 * números; aqui apenas os convertemos para texto no padrão brasileiro.
 * Valores ausentes (`null`, `undefined`, `''`) são exibidos como `—`, nunca como
 * zero fictício.
 */

const TRACO = '—';

const formatadorNumero = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const formatadorDecimal = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3
});

/**
 * @param {number|string|null|undefined} valor
 * @param {{ vazio?: string }} [opcoes]
 */
export function textoOuTraco(valor, { vazio = TRACO } = {}) {
  if (valor === null || valor === undefined) return vazio;
  const texto = String(valor).trim();
  return texto ? texto : vazio;
}

/**
 * @param {number|null|undefined} valor
 * @param {{ casas?: number, vazio?: string }} [opcoes]
 */
export function formatarNumero(valor, { casas = 0, vazio = TRACO } = {}) {
  const numero = paraNumero(valor);
  if (numero === null) return vazio;
  return (casas > 0 ? formatadorDecimal : formatadorNumero).format(numero);
}

/**
 * Quantidade de produtos (ex.: `1.234,5 kg`). A unidade é exibida apenas quando
 * informada, pois nem todo item de nota possui kg.
 *
 * @param {number|null|undefined} valor
 * @param {{ unidade?: string, vazio?: string }} [opcoes]
 */
export function formatarQuantidade(valor, { unidade = '', vazio = TRACO } = {}) {
  const numero = paraNumero(valor);
  if (numero === null) return vazio;
  const texto = formatadorDecimal.format(numero);
  return unidade ? `${texto} ${unidade}` : texto;
}

/**
 * CPF (11 dígitos) e CNPJ (14 dígitos); demais valores são devolvidos como estão.
 *
 * @param {string|null|undefined} valor
 * @param {{ vazio?: string }} [opcoes]
 */
export function formatarDocumento(valor, { vazio = TRACO } = {}) {
  const digitos = apenasDigitos(valor);
  if (!digitos) return vazio;

  if (digitos.length === 11) {
    return digitos.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }

  if (digitos.length === 14) {
    return digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  return String(valor).trim() || vazio;
}

/**
 * Telefone fixo (10 dígitos) ou celular (11 dígitos).
 *
 * @param {string|null|undefined} valor
 * @param {{ vazio?: string }} [opcoes]
 */
export function formatarTelefone(valor, { vazio = TRACO } = {}) {
  const digitos = apenasDigitos(valor);
  if (!digitos) return vazio;

  if (digitos.length === 11) {
    return digitos.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }

  if (digitos.length === 10) {
    return digitos.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }

  return String(valor).trim() || vazio;
}

/**
 * @param {unknown} valor
 * @returns {number|null}
 */
export function paraNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const numero = typeof valor === 'number' ? valor : Number(String(valor).replace(',', '.'));
  return Number.isFinite(numero) ? numero : null;
}

/**
 * Mantém apenas os dígitos de um documento ou telefone.
 *
 * @param {unknown} valor
 */
export function apenasDigitos(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).replace(/\D+/g, '');
}
