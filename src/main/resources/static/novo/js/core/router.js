import { APP_BASE } from './config.js';
import { getCurrentUser, isAuthenticated } from './auth.js';
import { hasRole } from './permissions.js';

/**
 * Roteador com History API.
 *
 * Contrato das rotas:
 *   { caminho, titulo?, publica?, papeis?, renderizar(ctx) }  -> pagina
 *   { caminho, redirecionar }                                 -> redireciona
 *
 * Rotas internas exigem sessao por padrao (publica: false).
 */
let rotas = [];
let renderizador = null;
let rotaNaoEncontrada = null;

function normalizar(caminho) {
  if (!caminho) return '/';
  let resultado = caminho.startsWith('/') ? caminho : '/' + caminho;
  if (resultado.length > 1 && resultado.endsWith('/')) {
    resultado = resultado.slice(0, -1);
  }
  return resultado;
}

export function definirRotas(definicoes) {
  rotas = definicoes;
}

export function definirRenderizador(fn) {
  renderizador = fn;
}

export function definirRotaNaoEncontrada(rota) {
  rotaNaoEncontrada = rota;
}

/** URL absoluta de uma rota interna (inclui o prefixo temporario). */
export function urlPara(caminho) {
  return APP_BASE + normalizar(caminho);
}

/** Caminho interno atual, sem o prefixo da aplicacao. */
export function caminhoAtual() {
  let caminho = window.location.pathname;
  if (APP_BASE && (caminho === APP_BASE || caminho.startsWith(APP_BASE + '/'))) {
    caminho = caminho.slice(APP_BASE.length);
  }
  return normalizar(caminho);
}

export function consultaAtual() {
  return new URLSearchParams(window.location.search);
}

/**
 * Verifica se a rota pode ser exibida para a sessao atual.
 * @returns {{ redirecionar: string, negado?: boolean } | null}
 */
export function guardarRota(rota) {
  if (rota.publica) return null;

  if (!isAuthenticated()) {
    const atual = caminhoAtual();
    const destino = atual === '/' || atual === '/login'
      ? '/login'
      : '/login?redirect=' + encodeURIComponent(atual);
    return { redirecionar: destino };
  }

  if (rota.papeis && !hasRole(getCurrentUser(), rota.papeis)) {
    return { redirecionar: '/dashboard', negado: true };
  }

  return null;
}

async function processar() {
  const caminho = caminhoAtual();
  const rota = rotas.find((item) => item.caminho === caminho) || rotaNaoEncontrada;

  if (rota && rota.redirecionar) {
    navegar(rota.redirecionar, { substituir: true });
    return;
  }

  if (rota) {
    const bloqueio = guardarRota(rota);
    if (bloqueio) {
      navegar(bloqueio.redirecionar, { substituir: true });
      return;
    }
  }

  if (rota && rota.titulo) {
    document.title = rota.titulo + ' – Integra PMAA';
  }

  await renderizador(rota, { caminho, consulta: consultaAtual() });
}

/** Navega para uma rota interna e atualiza a tela. */
export function navegar(caminho, { substituir = false, estado = null } = {}) {
  const url = urlPara(caminho);
  if (substituir) {
    history.replaceState(estado, '', url);
  } else {
    history.pushState(estado, '', url);
  }
  return processar();
}

function interceptarCliques(evento) {
  if (evento.defaultPrevented || evento.button !== 0) return;
  if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;

  const link = evento.target.closest('a[data-nav]');
  if (!link) return;

  const href = link.getAttribute('href');
  const pertence = href && (href === APP_BASE || href.startsWith(APP_BASE + '/'));
  if (!pertence) return;

  evento.preventDefault();
  navegar(href.slice(APP_BASE.length) || '/');
}

export function iniciarRoteador() {
  window.addEventListener('popstate', () => {
    processar().catch((erro) => console.error('Falha ao processar rota', erro));
  });
  document.addEventListener('click', interceptarCliques);

  return processar();
}
