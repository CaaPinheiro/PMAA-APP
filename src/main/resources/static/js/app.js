// ===== Helpers globais =====
function conteudo(html) {
    document.getElementById('conteudo-pagina').innerHTML = html;
}

const fmtBRL = v => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtData = iso => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
const fmtKg = v => (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kg';

const FAIXAS = {
    ZERO_A_SEIS: '0 a 6 anos',
    SETE_A_QUINZE: '7 a 15 anos',
    DEZESSEIS_A_DEZESSETE: '16 a 17 anos',
    DEZOITO_A_SESSENTA_QUATRO: '18 a 64 anos',
    ACIMA_SESSENTA_CINCO: '65 anos ou mais'
};

const REFEICOES = {
    CAFE_DA_MANHA: 'Café da manhã',
    ALMOCO: 'Almoço',
    CAFE_DA_TARDE: 'Café da tarde',
    LANCHE: 'Lanche',
    JANTAR: 'Jantar',
    CEIA: 'Ceia'
};

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// ===== Navegação =====
function navegar(pagina) {
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.pagina === pagina);
    });
    const paginas = {
        'dashboard': paginaDashboard,
        'agricultores': paginaAgricultores,
        'produtos': paginaProdutos,
        'beneficiarios': paginaBeneficiarios,
        'entregas-agricultor': paginaEntregasAgricultor,
        'entregas-cesta': paginaEntregasCesta,
        'pagamentos': paginaPagamentos,
        'funcionarios': paginaFuncionarios
    };
    (paginas[pagina] || paginaDashboard)().catch(err => {
        conteudo('<div class="card"><p>⚠️ ' + err.message + '</p></div>');
    });
}

// ===== Modal genérico =====
function abrirModal(titulo, corpoHtml, onSubmit) {
    fecharModal();
    const div = document.createElement('div');
    div.id = 'modal-overlay';
    div.innerHTML =
        '<div class="modal">' +
        '<div class="modal-header"><h3>' + titulo + '</h3>' +
        '<button type="button" class="modal-fechar" onclick="fecharModal()">✕</button></div>' +
        '<form id="modal-form">' + corpoHtml +
        '<div class="modal-acoes">' +
        '<button type="button" class="btn-secundario" onclick="fecharModal()">Cancelar</button>' +
        '<button type="submit" class="btn-primary">Salvar</button>' +
        '</div></form></div>';
    document.body.appendChild(div);
    div.addEventListener('click', e => { if (e.target === div) fecharModal(); });
    document.getElementById('modal-form').addEventListener('submit', async e => {
        e.preventDefault();
        const btn = e.target.querySelector('.btn-primary');
        btn.disabled = true;
        try {
            await onSubmit(e);
        } catch (err) {
            alert('⚠️ ' + err.message);
        } finally {
            btn.disabled = false;
        }
    });
}

function fecharModal() {
    const m = document.getElementById('modal-overlay');
    if (m) m.remove();
}

// ===== Impressão de comprovantes =====
function imprimirHTML(titulo, corpoHtml) {
    const w = window.open('', '_blank');
    w.document.write(
        '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + titulo + '</title>' +
        '<style>' +
        'body{font-family:Arial,sans-serif;padding:30px;max-width:700px;margin:auto;color:#111}' +
        'h2{text-align:center;margin-bottom:4px}' +
        '.sub{text-align:center;color:#555;font-size:13px;margin-bottom:24px}' +
        'table{width:100%;border-collapse:collapse;margin:16px 0}' +
        'th,td{border:1px solid #999;padding:8px;font-size:13px;text-align:left}' +
        'th{background:#eee}' +
        '.total{font-size:16px;font-weight:bold;text-align:right;margin-top:12px}' +
        '.assinatura{margin-top:70px;text-align:center}' +
        '.assinatura .linha{border-top:1px solid #333;width:300px;margin:0 auto;padding-top:6px;font-size:13px}' +
        '.info{font-size:14px;line-height:1.7}' +
        '</style></head><body>' + corpoHtml +
        '<script>window.onload=function(){window.print()}<' + '/script>' +
        '</body></html>');
    w.document.close();
}

// ===== Dashboard =====
async function paginaDashboard() {
    conteudo('<div class="page-header"><h2>📊 Dashboard</h2></div><p>Carregando...</p>');

    const [agricultores, produtos, beneficiarios, entregas] = await Promise.all([
        apiGet('/api/agricultores'),
        apiGet('/api/produtos'),
        apiGet('/api/beneficiarios'),
        apiGet('/api/entregas-agricultor')
    ]);

    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    const entregasMes = entregas.filter(e => {
        const d = new Date(e.dataEntrega + 'T00:00:00');
        return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    });
    const totalMes = entregasMes.reduce((s, e) =>
        s + e.itens.reduce((si, i) => si + i.quantidadeKg * i.precoPraticado, 0), 0);

    conteudo(
        '<div class="page-header"><h2>📊 Dashboard</h2>' +
        '<span style="color:var(--texto-suave)">' + MESES[mesAtual] + ' de ' + anoAtual + '</span></div>' +
        '<div class="cards-grid">' +
        cardStat('👨‍🌾', agricultores.length, 'Agricultores ativos', 'agricultores') +
        cardStat('🥦', produtos.length, 'Produtos no catálogo', 'produtos') +
        cardStat('🏛️', beneficiarios.length, 'Entidades beneficiárias', 'beneficiarios') +
        cardStat('📦', entregasMes.length, 'Entregas no mês', 'entregas-agricultor') +
        '</div>' +
        '<div class="card"><h3 style="margin-bottom:8px">💰 Valor total das entregas do mês</h3>' +
        '<div style="font-size:32px;font-weight:700;color:var(--verde-escuro)">' + fmtBRL(totalMes) + '</div>' +
        '<small style="color:var(--texto-suave)">Somatório de todas as entregas de agricultores em ' +
        MESES[mesAtual] + '/' + anoAtual + '</small></div>'
    );
}

function cardStat(icone, numero, rotulo, pagina) {
    return '<div class="card-stat" onclick="navegar(\'' + pagina + '\')">' +
        '<div class="icone">' + icone + '</div>' +
        '<div><div class="numero">' + numero + '</div>' +
        '<div class="rotulo">' + rotulo + '</div></div></div>';
}
