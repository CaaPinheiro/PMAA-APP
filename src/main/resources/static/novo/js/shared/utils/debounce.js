/**
 * Adia a execução de `fn` até que `ms` milissegundos passem sem novas chamadas.
 * O resultado retornado expõe `cancelar()` para interromper uma espera pendente
 * (usado ao limpar a busca ou desmontar a tela).
 *
 * @template {(...args: unknown[]) => unknown} F
 * @param {F} fn
 * @param {number} [ms]
 */
export function debounce(fn, ms = 350) {
  let timer = null;

  function cancelar() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function adiada(...args) {
    cancelar();
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, ms);
  }

  adiada.cancelar = cancelar;
  adiada.executarAgora = (...args) => {
    cancelar();
    fn(...args);
  };

  return adiada;
}
