/**
 * Helpers de DOM. Preferir sempre textContent; `html` existe apenas para
 * conteudo estatico controlado pela aplicacao, nunca para dados de usuario.
 */

/**
 * @param {string} tag
 * @param {Record<string, unknown>} [props]
 * @param {Node|string|Array<Node|string>|null} [children]
 */
export function el(tag, props = {}, children = null) {
  const node = document.createElement(tag);

  for (const [chave, valor] of Object.entries(props || {})) {
    if (valor === null || valor === undefined || valor === false) continue;

    if (chave === 'class') {
      node.className = valor;
    } else if (chave === 'text') {
      node.textContent = String(valor);
    } else if (chave === 'html') {
      node.innerHTML = valor;
    } else if (chave === 'dataset') {
      Object.assign(node.dataset, valor);
    } else if (chave.startsWith('on') && typeof valor === 'function') {
      node.addEventListener(chave.slice(2).toLowerCase(), valor);
    } else if (chave in node) {
      node[chave] = valor;
    } else {
      node.setAttribute(chave, valor === true ? '' : String(valor));
    }
  }

  acrescentar(node, children);
  return node;
}

function acrescentar(pai, filhos) {
  if (filhos === null || filhos === undefined || filhos === false) return pai;

  if (Array.isArray(filhos)) {
    filhos.forEach((filho) => acrescentar(pai, filho));
    return pai;
  }

  pai.appendChild(typeof filhos === 'string' ? document.createTextNode(filhos) : filhos);
  return pai;
}

export function limpar(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export function substituirConteudo(container, conteudo) {
  limpar(container);
  if (conteudo) acrescentar(container, conteudo);
  return container;
}
