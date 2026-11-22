import { definirHandlerSessaoExpirada } from './core/api-client.js';
import { getCurrentUser, logout, registrarAviso } from './core/auth.js';
import {
  caminhoAtual,
  definirRenderizador,
  definirRotaNaoEncontrada,
  definirRotas,
  iniciarRoteador,
  navegar
} from './core/router.js';
import { el, substituirConteudo } from './shared/utils/dom.js';
import { criarAppShell } from './layout/app-shell.js';
import { renderizarLogin } from './features/auth/login.page.js';
import { renderizarDashboard } from './features/dashboard/dashboard.page.js';
import { renderizarNaoEncontrada } from './features/not-found/not-found.page.js';
import { renderizarEmConstrucao } from './features/em-construcao.page.js';

const raiz = document.getElementById('app-root');

/** Instância única do shell; reaproveitada entre login e navegação. */
let shell = null;

const ROTAS = [
  { caminho: '/', redirecionar: '/dashboard' },
  { caminho: '/login', publica: true, titulo: 'Entrar', renderizar: renderizarLogin },
  { caminho: '/dashboard', titulo: 'Dashboard', renderizar: renderizarDashboard },
  {
    caminho: '/agricultores',
    titulo: 'Agricultores',
    renderizar: () => renderizarEmConstrucao('Agricultores', 'Cadastro de agricultores fornecedores.')
  },
  {
    caminho: '/produtos',
    titulo: 'Produtos',
    renderizar: () => renderizarEmConstrucao('Produtos', 'Catálogo de produtos e preço por kg.')
  },
  {
    caminho: '/beneficiarios',
    titulo: 'Beneficiários',
    renderizar: () => renderizarEmConstrucao('Beneficiários', 'Cadastro de entidades e públicos atendidos.')
  },
  {
    caminho: '/recebimentos/notas-diarias',
    titulo: 'Recebimentos',
    renderizar: () => renderizarEmConstrucao('Recebimentos', 'Notas diárias de recebimento de produtos.')
  },
  {
    caminho: '/recebimentos/notas-mensais',
    titulo: 'Recebimentos',
    renderizar: () => renderizarEmConstrucao('Recebimentos', 'Consolidação mensal dos recebimentos.')
  },
  {
    caminho: '/entregas/notas-diarias',
    titulo: 'Entregas',
    renderizar: () => renderizarEmConstrucao('Entregas', 'Notas diárias de entrega de cestas.')
  },
  {
    caminho: '/entregas/notas-mensais',
    titulo: 'Entregas',
    renderizar: () => renderizarEmConstrucao('Entregas', 'Consolidação mensal das entregas.')
  }
];

function sair() {
  logout();
  if (shell) shell.sairDaTela();
  navegar('/login', { substituir: true });
}

function shellAtual() {
  if (!shell) shell = criarAppShell({ aoSair: sair });
  return shell;
}

async function renderizar(rota, contexto) {
  if (!rota) return;

  if (rota.caminho === '/login') {
    if (shell) shell.sairDaTela();
    substituirConteudo(raiz, rota.renderizar(contexto));
    return;
  }

  const atual = shellAtual();

  if (raiz.firstChild !== atual.elemento) {
    substituirConteudo(raiz, atual.elemento);
  }

  atual.definirUsuario(getCurrentUser());
  atual.definirAtivo(contexto.caminho);
  atual.definirConteudo(rota.renderizar(contexto));
}

definirHandlerSessaoExpirada(() => {
  logout();
  registrarAviso('Sua sessão expirou. Entre novamente.');
  if (shell) shell.sairDaTela();
  if (caminhoAtual() !== '/login') {
    navegar('/login', { substituir: true });
  }
});

definirRotas(ROTAS);
definirRotaNaoEncontrada({
  titulo: 'Página não encontrada',
  renderizar: renderizarNaoEncontrada
});
definirRenderizador(renderizar);

iniciarRoteador().catch((erro) => {
  console.error('Falha ao iniciar a aplicação', erro);
  substituirConteudo(
    raiz,
    el('div', { class: 'alert alert--error', role: 'alert', text: 'Não foi possível carregar a aplicação.' })
  );
});
