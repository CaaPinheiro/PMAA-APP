import { STORAGE_KEYS } from './config.js';
import { apiPost, request } from './api-client.js';

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token);
}

/** @returns {{ id:number, nome:string, cargo?:string, papel:string } | null} */
export function getCurrentUser() {
  const bruto = localStorage.getItem(STORAGE_KEYS.user);
  if (!bruto) return null;
  try {
    return JSON.parse(bruto);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken() && getCurrentUser());
}

/**
 * Autentica no backend e preserva a estrutura atual de armazenamento do JWT
 * (integrapmaa_token / integrapmaa_usuario), compartilhada com o frontend legado.
 */
export async function login(usuario, senha) {
  const dados = await request('POST', '/auth/login', {
    body: { login: usuario, senha },
    sessao: false
  });

  if (!dados || !dados.token) {
    throw new Error('Resposta de login inválida.');
  }

  localStorage.setItem(STORAGE_KEYS.token, dados.token);
  localStorage.setItem(
    STORAGE_KEYS.user,
    JSON.stringify({ id: dados.id, nome: dados.nome, cargo: dados.cargo, papel: dados.papel })
  );

  return getCurrentUser();
}

/** Limpa a sessao local. A navegacao e responsabilidade do chamador. */
export function logout() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
}

/** Guarda um aviso para ser exibido na proxima tela de login. */
export function registrarAviso(mensagem) {
  if (mensagem) sessionStorage.setItem(STORAGE_KEYS.notice, mensagem);
}

/** Le e remove o aviso pendente da tela de login. */
export function consumirAviso() {
  const aviso = sessionStorage.getItem(STORAGE_KEYS.notice);
  if (aviso) sessionStorage.removeItem(STORAGE_KEYS.notice);
  return aviso;
}

export function changePassword(senhaAtual, novaSenha) {
  return apiPost('/auth/trocar-senha', { senhaAtual, novaSenha });
}
