/**
 * Máscaras aplicadas durante a digitação. Sempre retornam texto formatado; o
 * payload deve continuar sendo enviado com os dígitos crus (ver `onlyDigitos`)
 * ou com o número puro no caso de moeda.
 */
import { formatarDocumento, formatarTelefone } from './formatters.js';

/**
 * @param {unknown} valor
 */
export function mascararDocumento(valor) {
  const digitos = String(valor ?? '').replace(/\D+/g, '').slice(0, 14);
  return digitos ? formatarDocumento(digitos) : '';
}

/**
 * @param {unknown} valor
 */
export function mascararTelefone(valor) {
  const digitos = String(valor ?? '').replace(/\D+/g, '').slice(0, 11);
  return digitos ? formatarTelefone(digitos) : '';
}

/**
 * Formata centavos digitados como moeda brasileira: `123456` → `R$ 1.234,56`.
 *
 * @param {unknown} valor
 */
export function mascararMoeda(valor) {
  const digitos = String(valor ?? '').replace(/\D+/g, '');
  if (!digitos) return '';

  const centavos = Number(digitos.slice(-15)) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(centavos);
}

/**
 * Converte o texto mascarado (`R$ 1.234,56`) no número esperado pela API
 * (`1234.56`).
 *
 * @param {unknown} valor
 * @returns {number|null}
 */
export function moedaParaNumero(valor) {
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim();
  if (!texto) return null;

  const normalizado = texto.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : null;
}

/**
 * Aplica uma máscara a um `input` mantendo o cursor ao final, comportamento
 * esperado para blocos de dígitos (CPF/CNPJ, telefone, valores).
 *
 * @param {HTMLInputElement} input
 * @param {(valor: string) => string} mascarar
 */
export function aplicarMascara(input, mascarar) {
  const aplicar = () => {
    const formatado = mascarar(input.value);
    if (formatado === input.value) return;
    input.value = formatado;
    input.setSelectionRange(formatado.length, formatado.length);
  };

  input.addEventListener('input', aplicar);
  return () => input.removeEventListener('input', aplicar);
}
