import { el } from '../../shared/utils/dom.js';
import { consumirAviso, login } from '../../core/auth.js';
import { navegar } from '../../core/router.js';

function destinoSeguro(consulta) {
  const destino = consulta && consulta.get('redirect');
  if (!destino || !destino.startsWith('/') || destino.startsWith('//')) {
    return '/dashboard';
  }
  return destino;
}

/** Tela de login (Fase 1: estrutura e integração; fidelidade visual na Fase 2). */
export function renderizarLogin(contexto = {}) {
  const erro = el('div', { class: 'alert alert--error', role: 'alert', hidden: true });

  const campoLogin = el('input', {
    type: 'text',
    id: 'login-usuario',
    name: 'login',
    placeholder: 'Seu nome de usuário',
    autocomplete: 'username',
    required: true
  });

  const campoSenha = el('input', {
    type: 'password',
    id: 'login-senha',
    name: 'senha',
    placeholder: 'Sua senha',
    autocomplete: 'current-password',
    required: true
  });

  const botao = el('button', { type: 'submit', class: 'btn btn--primary btn--block', text: 'Entrar' });

  function mostrarErro(mensagem) {
    erro.textContent = mensagem;
    erro.hidden = false;
  }

  const aviso = consumirAviso();
  if (aviso) mostrarErro(aviso);

  const formulario = el('form', { class: 'login-form', noValidate: true }, [
    el('div', { class: 'field' }, [
      el('label', { class: 'field__label', for: 'login-usuario', text: 'Login' }),
      campoLogin
    ]),
    el('div', { class: 'field' }, [
      el('label', { class: 'field__label', for: 'login-senha', text: 'Senha' }),
      campoSenha
    ]),
    erro,
    botao
  ]);

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    erro.hidden = true;

    const usuario = campoLogin.value.trim();
    const senha = campoSenha.value;

    if (!usuario || !senha) {
      mostrarErro('Informe login e senha.');
      return;
    }

    botao.disabled = true;
    botao.textContent = 'Entrando...';

    try {
      await login(usuario, senha);
      await navegar(destinoSeguro(contexto.consulta), { substituir: true });
    } catch (falha) {
      mostrarErro(falha.message || 'Não foi possível entrar.');
      campoLogin.focus();
    } finally {
      botao.disabled = false;
      botao.textContent = 'Entrar';
    }
  });

  const tela = el('div', { class: 'login-screen' }, [
    el('div', { class: 'login-card' }, [
      el('h1', { class: 'login-brand' }, [
        el('span', { text: 'integra' }),
        el('strong', { text: 'PMAA' })
      ]),
      el('p', {
        class: 'login-subtitle',
        text: 'Programa Municipal de Aquisição de Alimentos'
      }),
      el('p', { class: 'login-subtitle', text: 'Prefeitura Municipal de Barcarena - PA' }),
      formulario
    ])
  ]);

  queueMicrotask(() => campoLogin.focus());
  return tela;
}
