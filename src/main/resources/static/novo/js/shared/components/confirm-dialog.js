import { el } from '../utils/dom.js';
import { icone } from '../../layout/icons.js';
import { abrirModal } from './modal.js';

/**
 * Confirmação explícita para ações destrutivas.
 *
 * A operação chega pela feature; o diálogo cuida de processamento, erro (mantém
 * aberto para nova tentativa) e do resultado em `Promise<boolean>`.
 *
 * @param {{
 *   titulo: string,
 *   mensagem: string,
 *   detalhe?: string|null,
 *   rotuloConfirmar?: string,
 *   rotuloCancelar?: string,
 *   aoConfirmar: () => Promise<unknown>
 * }} opcoes
 * @returns {Promise<boolean>}
 */
export function confirmarAcao({
  titulo,
  mensagem,
  detalhe = null,
  rotuloConfirmar = 'Excluir',
  rotuloCancelar = 'Cancelar',
  aoConfirmar
}) {
  return new Promise((resolver) => {
    let confirmado = false;

    const conteudo = el('div', { class: 'confirm-dialog' }, [
      el('span', { class: 'confirm-dialog__icone icone', html: icone('aviso'), 'aria-hidden': 'true' }),
      el('p', { class: 'confirm-dialog__mensagem', text: mensagem }),
      detalhe ? el('p', { class: 'confirm-dialog__detalhe', text: detalhe }) : null
    ]);

    abrirModal({
      titulo,
      conteudo,
      aoFechar: () => resolver(confirmado),
      acoes: [
        {
          rotulo: rotuloCancelar,
          variante: 'secundaria',
          aoAcionar: (contexto) => contexto.fechar()
        },
        {
          rotulo: rotuloConfirmar,
          variante: 'perigo',
          fecharAoAcionar: false,
          aoAcionar: async (contexto) => {
            contexto.limparErro();
            contexto.definirProcessando(true);
            try {
              await aoConfirmar();
              confirmado = true;
              contexto.fechar();
            } catch (erro) {
              console.error('Falha na confirmação', erro);
              contexto.definirProcessando(false);
              contexto.mostrarErro(erro && erro.message
                ? erro.message
                : 'Não foi possível concluir a operação. Tente novamente.');
            }
          }
        }
      ]
    });
  });
}
