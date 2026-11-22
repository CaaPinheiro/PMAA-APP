/**
 * Validações de formulário. Retornam `boolean` para uso direto nas features e
 * não conhecem componente, tela ou service.
 */
import { apenasDigitos } from './formatters.js';

export const MENSAGENS = {
  obrigatorio: 'Campo obrigatório.',
  cpf: 'Informe um CPF válido.',
  cnpj: 'Informe um CNPJ válido.',
  documento: 'Informe um CPF ou CNPJ válido.',
  email: 'Informe um e-mail válido.',
  telefone: 'Informe um telefone válido com DDD.',
  data: 'Informe uma data válida.',
  numero: 'Informe um número válido.',
  positivo: 'Informe um valor maior que zero.'
};

/**
 * @param {unknown} valor
 */
export function obrigatorio(valor) {
  if (valor === null || valor === undefined) return false;
  return String(valor).trim().length > 0;
}

/** @param {string} valor apenas dígitos */
export function validarCPF(valor) {
  const cpf = apenasDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calcularDigito = (base) => {
    let soma = 0;
    for (let indice = 0; indice < base.length; indice += 1) {
      soma += Number(base[indice]) * (base.length + 1 - indice);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return calcularDigito(cpf.slice(0, 9)) === Number(cpf[9]) &&
    calcularDigito(cpf.slice(0, 10)) === Number(cpf[10]);
}

/** @param {string} valor apenas dígitos */
export function validarCNPJ(valor) {
  const cnpj = apenasDigitos(valor);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const calcularDigito = (base) => {
    const pesos = base.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const soma = base.split('').reduce((total, digito, indice) => total + Number(digito) * pesos[indice], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  return calcularDigito(cnpj.slice(0, 12)) === Number(cnpj[12]) &&
    calcularDigito(cnpj.slice(0, 13)) === Number(cnpj[13]);
}

/**
 * @param {string} valor
 * @param {{ tipo?: 'cpf'|'cnpj'|'ambos' }} [opcoes]
 */
export function validarDocumento(valor, { tipo = 'ambos' } = {}) {
  if (tipo === 'cpf') return validarCPF(valor);
  if (tipo === 'cnpj') return validarCNPJ(valor);

  const digitos = apenasDigitos(valor);
  if (digitos.length === 11) return validarCPF(digitos);
  if (digitos.length === 14) return validarCNPJ(digitos);
  return false;
}

/** @param {unknown} valor */
export function validarEmail(valor) {
  const texto = String(valor ?? '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto);
}

/** @param {unknown} valor */
export function validarTelefone(valor) {
  const digitos = apenasDigitos(valor);
  return digitos.length === 10 || digitos.length === 11;
}

/**
 * @param {unknown} valor data ISO (`yyyy-MM-dd`) ou `Date`
 */
export function validarData(valor) {
  if (!valor) return false;
  const data = valor instanceof Date ? valor : new Date(`${String(valor)}T00:00:00`);
  return !Number.isNaN(data.getTime());
}

/**
 * Valida um conjunto de campos e devolve os erros por nome.
 * A feature decide como exibir cada mensagem.
 *
 * @param {Record<string, { valor: unknown, regras: Array<(valor: unknown) => boolean>, mensagem?: string }>} campos
 * @returns {Record<string, string>}
 */
export function validarCampos(campos) {
  const erros = {};

  for (const [nome, definicao] of Object.entries(campos)) {
    const invalido = (definicao.regras || []).some((regra) => !regra(definicao.valor));
    if (invalido) erros[nome] = definicao.mensagem || MENSAGENS.obrigatorio;
  }

  return erros;
}
