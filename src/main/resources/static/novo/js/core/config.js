/**
 * Constantes da aplicacao.
 *
 * APP_BASE e o prefixo temporario da nova implementacao durante a transicao.
 * As chamadas de API usam caminhos absolutos e NAO passam por APP_BASE.
 * Apos o corte, APP_BASE passa a ser ''.
 */
export const APP_BASE = '/novo';

export const API_BASE = '/api';

export const STORAGE_KEYS = Object.freeze({
  token: 'integrapmaa_token',
  user: 'integrapmaa_usuario',
  notice: 'integrapmaa_aviso'
});
