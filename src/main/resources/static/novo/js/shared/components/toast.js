import { el } from '../utils/dom.js';

/**
 * Mensagens temporárias de feedback (sucesso ou erro).
 * A região é criada sob demanda e permanece no `body` durante a sessão.
 */
let regiao = null;

function obterRegiao() {
  if (regiao && regiao.isConnected) return regiao;

  regiao = el('div', {
    class: 'toast-region',
    'aria-live': 'polite',
    'aria-atomic': 'false'
  });
  document.body.appendChild(regiao);
  return regiao;
}

/**
 * @param {string} mensagem
 * @param {{ tipo?: 'sucesso'|'erro'|'informacao', duracao?: number }} [opcoes]
 * @returns {{ fechar: () => void }}
 */
export function mostrarToast(mensagem, { tipo = 'sucesso', duracao = 4000 } = {}) {
  const container = obterRegiao();

  const item = el('div', { class: `toast toast--${tipo}` });
  item.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');

  item.appendChild(el('p', { class: 'toast__mensagem', text: mensagem }));

  let timer = null;

  function fechar() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    item.remove();
    if (container.childElementCount === 0) {
      container.remove();
      regiao = null;
    }
  }

  item.appendChild(
    el('button', {
      type: 'button',
      class: 'toast__fechar',
      'aria-label': 'Fechar mensagem',
      text: '×',
      onClick: fechar
    })
  );

  function agendar() {
    if (duracao <= 0) return;
    timer = setTimeout(fechar, duracao);
  }

  item.addEventListener('mouseenter', () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  });
  item.addEventListener('mouseleave', agendar);
  item.addEventListener('focusin', () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  });
  item.addEventListener('focusout', agendar);

  container.appendChild(item);
  agendar();

  return { fechar };
}
