// ===================== HELPERS GLOBAIS =====================
function conteudo(html) {
    document.getElementById('conteudo-pagina').innerHTML = html;
}

function escapar(texto) {
    if (texto === null || texto === undefined) return '';
    return String(texto)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const fmtBRL = v => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtNum = v => (Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtKg  = v => fmtNum(v) + ' kg';
const fmtData = iso => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
const hojeISO = () => new Date().toISOString().slice(0, 10);

const FAIXAS = {
    ZERO_A_SEIS: '0 a 6 anos',
    SETE_A_QUINZE: '7 a 15 anos',
    DEZESSEIS_A_DEZESSETE: '16 a 17 anos',
    DEZOITO_A_SESSENTA_QUATRO: '18 a 64 anos',
    ACIMA_SESSENTA_CINCO: '65 anos ou mais'
};
const REFEICOES = {
    CAFE_DA_MANHA: 'Café da manhã', ALMOCO: 'Almoço', CAFE_DA_TARDE: 'Café da tarde',
    LANCHE: 'Lanche', JANTAR: 'Jantar', CEIA: 'Ceia'
};
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const ORGAO = 'Prefeitura Municipal de Barcarena – PA<br>Secretaria Municipal de Assistência Social (SEMAS)';

// Caches compartilhados entre os módulos
let AGRICULTORES = [], PRODUTOS = [], BENEFICIARIOS = [];

// ===================== NAVEGAÇÃO =====================
const PAGINAS = {};

function registrarPagina(nome, funcao) { PAGINAS[nome] = funcao; }

function navegar(pagina) {
    document.querySelectorAll('.nav-item').forEach(el =>
        el.classList.toggle('active', el.dataset.pagina === pagina));

    const carregar = PAGINAS[pagina] || PAGINAS['dashboard'];
    Promise.resolve()
        .then(() => carregar())
        .catch(erro => {
            conteudo('<div class="card"><h3>Não foi possível carregar esta página</h3><p>'
                + escapar(erro.message) + '</p></div>');
        });
}

// ===================== TOAST =====================
function toast(mensagem, tipo) {
    let area = document.getElementById('toast-area');
    if (!area) {
        area = document.createElement('div');
        area.id = 'toast-area';
        document.body.appendChild(area);
    }
    const el = document.createElement('div');
    el.className = 'toast' + (tipo ? ' ' + tipo : '');
    el.textContent = mensagem;
    area.appendChild(el);
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 300);
    }, 4000);
}

// ===================== MODAL =====================
function abrirModal(titulo, corpoHtml, aoSalvar, opcoes) {
    opcoes = opcoes || {};
    fecharModal();

    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.innerHTML =
        '<div class="modal' + (opcoes.largo ? ' largo' : '') + '">' +
          '<div class="modal-header"><h3>' + titulo + '</h3>' +
          '<button type="button" class="modal-fechar" onclick="fecharModal()">✕</button></div>' +
          '<form id="modal-form">' + corpoHtml +
            '<div class="modal-acoes">' +
              '<button type="button" class="btn-secundario" onclick="fecharModal()">Cancelar</button>' +
              '<button type="submit" class="btn-primary">' + (opcoes.rotuloSalvar || 'Salvar') + '</button>' +
            '</div>' +
          '</form>' +
        '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', e => { if (e.target === overlay) fecharModal(); });

    document.getElementById('modal-form').addEventListener('submit', async e => {
        e.preventDefault();
        const botao = e.target.querySelector('button[type=submit]');
        const rotulo = botao.textContent;
        botao.disabled = true;
        botao.textContent = 'Salvando...';
        try {
            await aoSalvar(e);
        } catch (erro) {
            toast(erro.message, 'erro');
        } finally {
            botao.disabled = false;
            botao.textContent = rotulo;
        }
    });
}

function fecharModal() {
    const m = document.getElementById('modal-overlay');
    if (m) m.remove();
}

/** Modal apenas de leitura (comprovantes e relatórios). */
function abrirDocumento(titulo, corpoHtml, idImpressao) {
    fecharModal();
    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.innerHTML =
        '<div class="modal largo">' +
          '<div class="modal-header"><h3>' + titulo + '</h3>' +
          '<button type="button" class="modal-fechar" onclick="fecharModal()">✕</button></div>' +
          '<div id="' + idImpressao + '">' + corpoHtml + '</div>' +
          '<div class="modal-acoes">' +
            '<button type="button" class="btn-secundario" onclick="fecharModal()">Fechar</button>' +
            '<button type="button" class="btn-primary" onclick="imprimirElemento(\'' + idImpressao + '\', \'' + titulo + '\')">🖨️ Imprimir / Salvar em PDF</button>' +
          '</div>' +
        '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) fecharModal(); });
}

// ===================== IMPRESSÃO / PDF (RF04, RF06, RF08) =====================
function imprimirElemento(idElemento, titulo) {
    const elemento = document.getElementById(idElemento);
    if (!elemento) return;
    imprimirHTML(titulo, elemento.innerHTML);
}

function imprimirHTML(titulo, corpoHtml) {
    const janela = window.open('', '_blank');
    if (!janela) {
        toast('O navegador bloqueou a janela de impressão. Libere os pop-ups deste site.', 'erro');
        return;
    }
    const estilos =
        'body{font-family:Arial,Helvetica,sans-serif;padding:26px;max-width:760px;margin:auto;color:#111}' +
        'h2{text-align:center;font-size:16px;margin-bottom:3px}' +
        'h4{font-size:13px;margin:16px 0 4px}' +
        '.org{text-align:center;color:#555;font-size:11px;margin-bottom:18px}' +
        '.info{font-size:12px;line-height:1.7;margin-bottom:10px}' +
        'table{width:100%;border-collapse:collapse;margin:10px 0}' +
        'th,td{border:1px solid #999;padding:5px 7px;font-size:11px;text-align:left}' +
        'th{background:#eee}' +
        'td.num,th.num{text-align:right}' +
        'tfoot td{font-weight:bold;background:#f3f4f6}' +
        '.total{font-size:13px;font-weight:bold;text-align:right;margin-top:8px}' +
        '.assinatura{margin-top:52px;text-align:center}' +
        '.assinatura .linha{border-top:1px solid #333;width:270px;margin:0 auto;padding-top:5px;font-size:11px}' +
        '.rodape{margin-top:18px;font-size:10px;color:#666;text-align:center}' +
        '@page{margin:14mm}';

    janela.document.write(
        '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>' +
        titulo + '</title><style>' + estilos + '</style></head><body>' +
        corpoHtml +
        '<scr' + 'ipt>window.onload=function(){window.print();}</scr' + 'ipt>' +
        '</body></html>');
    janela.document.close();
}

function rodapeDocumento() {
    return '<div class="rodape">Documento gerado pelo Integra PMAA em ' +
        new Date().toLocaleString('pt-BR') + '</div>';
}

// ===================== SELETOR DE PERÍODO =====================
function seletorPeriodo(idMes, idAno) {
    const agora = new Date();
    const opcoesMes = MESES.map((m, i) =>
        '<option value="' + (i + 1) + '"' + (i === agora.getMonth() ? ' selected' : '') + '>' + m + '</option>'
    ).join('');
    return '<div class="campo"><label>Mês</label><select id="' + idMes + '">' + opcoesMes + '</select></div>' +
           '<div class="campo"><label>Ano</label>' +
           '<input type="number" id="' + idAno + '" value="' + agora.getFullYear() + '" min="2000" max="2100" style="width:100px"></div>';
}

// ===================== ITENS DINÂMICOS =====================
function linhaItemHtml(produtosPermitidos) {
    const lista = (produtosPermitidos && produtosPermitidos.length) ? produtosPermitidos : PRODUTOS;
    const opcoes = lista.map(p =>
        '<option value="' + p.id + '">' + escapar(p.nome) + ' — ' + fmtBRL(p.precoKg) + '/kg</option>'
    ).join('');
    return '<div class="item-linha">' +
             '<select class="item-produto" required><option value="">Selecione o produto...</option>' + opcoes + '</select>' +
             '<input type="number" class="item-qtd" step="0.01" min="0.01" placeholder="Qtd (kg)" required>' +
             '<button type="button" class="item-remover" onclick="removerLinhaItem(this)" title="Remover item">✕</button>' +
           '</div>';
}

function adicionarLinhaItem(produtosPermitidos) {
    document.getElementById('itens-container')
        .insertAdjacentHTML('beforeend', linhaItemHtml(produtosPermitidos));
}

function removerLinhaItem(botao) {
    const container = document.getElementById('itens-container');
    if (container.querySelectorAll('.item-linha').length <= 1) {
        toast('A entrega precisa de pelo menos um item.', 'erro');
        return;
    }
    botao.parentElement.remove();
}

function coletarItens() {
    const itens = [];
    document.querySelectorAll('.item-linha').forEach(linha => {
        const produtoId = linha.querySelector('.item-produto').value;
        const quantidade = parseFloat(linha.querySelector('.item-qtd').value);
        if (!produtoId || !quantidade) return;
        itens.push({ produto: { id: parseInt(produtoId, 10) }, quantidadeKg: quantidade });
    });
    if (!itens.length) throw new Error('Preencha pelo menos um item com produto e quantidade.');
    return itens;
}

// ===================== DASHBOARD =====================
registrarPagina('dashboard', async function () {
    conteudo('<div class="page-header"><h2>📊 Início</h2></div><div class="card">Carregando...</div>');

    const r = await apiGet('/api/relatorios/resumo');
    const periodo = MESES[r.mes - 1] + ' de ' + r.ano;

    const alertaDap = r.dapsVencidas > 0
        ? '<div class="aviso">⚠️ ' + r.dapsVencidas + ' agricultor(es) com DAP vencida. ' +
          'Verifique o cadastro antes de registrar novos recebimentos.</div>'
        : '';

    conteudo(
        '<div class="page-header"><div><h2>📊 Início</h2>' +
        '<div class="sub">Indicadores de ' + periodo + '</div></div></div>' +
        alertaDap +
        '<div class="cards-grid">' +
          cardStat('👨‍🌾', r.agricultoresAtivos, 'Agricultores ativos', 'agricultores') +
          cardStat('🥦', r.produtosAtivos, 'Produtos no catálogo', 'produtos') +
          cardStat('🏛️', r.beneficiariosAtivos, 'Entidades beneficiárias', 'beneficiarios') +
          cardStat('📦', r.entregasAgricultorMes, 'Recebimentos no mês', 'entregas-agricultor') +
          cardStat('🧺', r.entregasCestaMes, 'Cestas entregues no mês', 'entregas-cesta') +
        '</div>' +
        '<div class="card destaque">' +
          '<div><div class="rotulo">Valor a pagar aos agricultores</div>' +
            '<div class="valor">' + fmtBRL(r.valorRecebidoMes) + '</div>' +
            '<small style="color:var(--texto-suave)">Referente a ' + periodo + '</small></div>' +
          '<div><div class="rotulo">Recebido dos agricultores</div>' +
            '<div class="valor">' + fmtKg(r.quantidadeRecebidaKgMes) + '</div></div>' +
          '<div><div class="rotulo">Distribuído às entidades</div>' +
            '<div class="valor">' + fmtKg(r.quantidadeDistribuidaKgMes) + '</div></div>' +
        '</div>'
    );
});

function cardStat(icone, numero, rotulo, pagina) {
    return '<div class="card-stat" onclick="navegar(\'' + pagina + '\')">' +
             '<div class="icone">' + icone + '</div>' +
             '<div><div class="numero">' + numero + '</div>' +
             '<div class="rotulo">' + rotulo + '</div></div>' +
           '</div>';
}
