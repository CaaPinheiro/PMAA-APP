import { API_BASE, STORAGE_KEYS } from './config.js';

/** Erro normalizado de uma chamada à API. */
export class ApiError extends Error {
  constructor(mensagem, status, corpo) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.corpo = corpo;
  }
}

/**
 * Handler executado quando a API responde 401 em uma chamada autenticada.
 * Registrado por `app.js` para evitar dependência circular entre o cliente
 * HTTP e a sessão.
 */
let aoExpirarSessao = null;

export function definirHandlerSessaoExpirada(handler) {
  aoExpirarSessao = handler;
}

function tokenAtual() {
  return localStorage.getItem(STORAGE_KEYS.token);
}

/**
 * Única camada de fetch da aplicação.
 * @param {string} metodo
 * @param {string} caminho caminho relativo à API (ex.: '/agricultores')
 * @param {{ body?: unknown, headers?: Record<string,string>, signal?: AbortSignal,
 *           sessao?: boolean }} [opcoes]
 *   `sessao: false` identifica chamadas públicas (login), que não devem
 *   disparar o tratamento de sessão expirada.
 */
export async function request(metodo, caminho, opcoes = {}) {
  const { body, headers = {}, signal, sessao = true } = opcoes;
  const url = caminho.startsWith('/') ? API_BASE + caminho : caminho;

  const config = {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...headers },
    signal
  };

  const token = tokenAtual();
  if (token) config.headers.Authorization = 'Bearer ' + token;
  if (body !== undefined) config.body = JSON.stringify(body);

  let resposta;
  try {
    resposta = await fetch(url, config);
  } catch (erro) {
    if (erro && erro.name === 'AbortError') throw erro;
    throw new ApiError('Não foi possível falar com o servidor. Ele ainda está rodando?', 0, null);
  }

  if (resposta.status === 204) return null;

  const dados = await resposta.json().catch(() => null);

  if (resposta.status === 401) {
    if (sessao && aoExpirarSessao) aoExpirarSessao();
    throw new ApiError(
      (dados && dados.mensagem) || 'Sua sessão expirou. Entre novamente.',
      401,
      dados
    );
  }

  if (resposta.status === 403 && sessao) {
    throw new ApiError(
      (dados && dados.mensagem) || 'Acesso negado. Esta operação exige perfil de administrador.',
      403,
      dados
    );
  }

  if (!resposta.ok) {
    throw new ApiError(
      (dados && dados.mensagem) || 'Erro ' + resposta.status,
      resposta.status,
      dados
    );
  }

  return dados;
}

export const apiGet = (caminho, opcoes) => request('GET', caminho, opcoes);
export const apiPost = (caminho, body, opcoes) => request('POST', caminho, { ...opcoes, body });
export const apiPut = (caminho, body, opcoes) => request('PUT', caminho, { ...opcoes, body });
export const apiDelete = (caminho, opcoes) => request('DELETE', caminho, opcoes);
