import { el } from '../utils/dom.js';
import { icone } from '../../layout/icons.js';

/**
 * Seção de formulário dentro de modais e páginas de cadastro: ícone, título e
 * corpo. As seções organizam os campos, mas cada campo pertence à feature.
 *
 * @param {{
 *   titulo: string,
 *   icone?: string|null,
 *   descricao?: string|null,
 *   conteudo: Node|Node[]|null
 * }} opcoes
 */
export function criarFormSection({ titulo, icone: nomeIcone = null, descricao = null, conteudo = null }) {
  const idTitulo = `form-section-${Math.random().toString(36).slice(2, 9)}`;

  const cabecalho = el('header', { class: 'form-section__cabecalho' }, [
    nomeIcone ? el('span', { class: 'form-section__icone icone', html: icone(nomeIcone) }) : null,
    el('h3', { class: 'form-section__titulo', id: idTitulo, text: titulo })
  ]);

  const section = el('section', { class: 'form-section', 'aria-labelledby': idTitulo }, [
    cabecalho,
    descricao ? el('p', { class: 'form-section__descricao', text: descricao }) : null,
    el('div', { class: 'form-section__corpo' }, conteudo)
  ]);

  return section;
}
