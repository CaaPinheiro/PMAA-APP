import { el } from '../utils/dom.js';
import { icone } from '../../layout/icons.js';
import { debounce } from '../utils/debounce.js';

/**
 * Campo de busca com debounce. A busca é executada pelo backend; este
 * componente apenas informa o texto digitado.
 *
 * @param {{
 *   rotulo?: string,
 *   placeholder?: string,
 *   valor?: string,
 *   aoBuscar: (texto: string) => void,
 *   debounceMs?: number
 * }} opcoes
 */
export function criarSearchField({
  rotulo = 'Pesquisar',
  placeholder = 'Buscar por nome ou código',
  valor = '',
  aoBuscar,
  debounceMs = 350
}) {
  const id = `busca-${Math.random().toString(36).slice(2, 9)}`;

  const input = el('input', {
    id,
    type: 'search',
    class: 'search-field__input',
    placeholder,
    autocomplete: 'off',
    value: valor
  });

  const disparar = debounce(() => aoBuscar(input.value.trim()), debounceMs);

  input.addEventListener('input', disparar);
  input.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      disparar.executarAgora();
    }
    if (evento.key === 'Escape' && input.value) {
      evento.stopPropagation();
      input.value = '';
      disparar.executarAgora();
    }
  });

  const campo = el('div', { class: 'search-field' }, [
    el('span', { class: 'search-field__icone icone icone--sm', html: icone('buscar'), 'aria-hidden': 'true' }),
    el('label', { class: 'sr-only', for: id, text: rotulo }),
    input
  ]);

  return {
    elemento: campo,
    valor: () => input.value.trim(),
    definirValor: (texto) => {
      input.value = texto ?? '';
    },
    limpar: () => {
      disparar.cancelar();
      input.value = '';
    }
  };
}
