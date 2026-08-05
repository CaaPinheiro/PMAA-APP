let ENTREGAS_AGR = [];

async function paginaEntregasAgricultor() {
    conteudo(`
        <div class="page-header">
            <h2>📦 Entregas de Agricultores</h2>
            <button class="btn-primary" onclick="abrirFormEntregaAgr()">+ Registrar Entrega</button>
        </div>
        <div class="filtros">
            <label>Filtrar por agricultor:</label>
            <select id="filtro-agricultor" onchange="carregarEntregasAgr()">
                <option value="">Todos</option>
            </select>
        </div>
        <div class="card">
            <table class="tabela">
                <thead><tr>
                    <th>Data</th><th>Agricultor</th><th>Itens</th><th>Total Kg</th><th>Valor Total</th><th></th>
                </tr></thead>
                <tbody id="tb-entregas-agr"><tr><td colspan="6" class="vazio">Carregando...</td></tr></tbody>
            </table>
        </div>`);

    // Carrega agricultores e produtos para os selects
    [AGRICULTORES, PRODUTOS] = await Promise.all([
        apiGet('/api/agricultores'),
        apiGet('/api/produtos')
    ]);
    document.getElementById('filtro-agricultor').innerHTML =
        '<option value="">Todos</option>' +
        AGRICULTORES.map(a => `<option value="${a.id}">${a.nome}</option>`).join('');

    await carregarEntregasAgr();
}

async function carregarEntregasAgr() {
    const filtro = document.getElementById('filtro-agricultor').value;
    ENTREGAS_AGR = filtro
        ? await apiGet('/api/entregas-agricultor/agricultor/' + filtro)
        : await apiGet('/api/entregas-agricultor');

    const tb = document.getElementById('tb-entregas-agr');
    if (!ENTREGAS_AGR.length) {
        tb.innerHTML = '<tr><td colspan="6" class="vazio">Nenhuma entrega registrada</td></tr>';
        return;
    }
    tb.innerHTML = ENTREGAS_AGR.map(e => {
        const totalKg = e.itens.reduce((s, i) => s + i.quantidadeKg, 0);
        const totalValor = e.itens.reduce((s, i) => s + i.quantidadeKg * i.precoPraticado, 0);
        return `
        <tr>
            <td>${fmtData(e.dataEntrega)}</td>
            <td><strong>${e.agricultor.nome}</strong></td>
            <td>${e.itens.length} item(ns)</td>
            <td>${fmtKg(totalKg)}</td>
            <td><strong>${fmtBRL(totalValor)}</strong></td>
            <td class="acoes">
                <button class="btn-icone" title="Imprimir comprovante"
                    onclick="comprovanteEntregaAgr(${e.id})">🖨️</button>
            </td>
        </tr>`;
    }).join('');
}

function linhaItemHtml() {
    return `
        <div class="item-linha">
            <select class="item-produto" required>
                <option value="">Selecione o produto...</option>
                ${PRODUTOS.map(p => `<option value="${p.id}">${p.nome} — ${fmtBRL(p.precoKg)}/kg</option>`).join('')}
            </select>
            <input type="number" class="item-qtd" step="0.01" min="0.01" placeholder="Qtd (kg)" required>
            <button type="button" class="item-remover" onclick="this.parentElement.remove()">✕</button>
        </div>`;
}

function adicionarLinhaItem() {
    document.getElementById('itens-container').insertAdjacentHTML('beforeend', linhaItemHtml());
}

function coletarItens() {
    return [...document.querySelectorAll('.item-linha')].map(l => ({
        produto: { id: parseInt(l.querySelector('.item-produto').value) },
        quantidadeKg: parseFloat(l.querySelector('.item-qtd').value)
    }));
}

function abrirFormEntregaAgr() {
    if (!AGRICULTORES.length) { alert('Cadastre pelo menos um agricultor primeiro.'); return; }
    if (!PRODUTOS.length) { alert('Cadastre pelo menos um produto primeiro.'); return; }

    abrirModal('Registrar Entrega de Agricultor', `
        <div class="linha-2">
            <div class="campo"><label>Agricultor *</label>
                <select id="f-agricultor" required>
                    <option value="">Selecione...</option>
                    ${AGRICULTORES.map(a => `<option value="${a.id}">${a.nome}</option>`).join('')}
                </select></div>
            <div class="campo"><label>Data da entrega *</label>
                <input type="date" id="f-data" value="${new Date().toISOString().slice(0, 10)}" required></div>
        </div>
        <div class="campo">
            <label>Itens entregues * <small>(o preço vigente do produto é aplicado automaticamente)</small></label>
            <div id="itens-container">${linhaItemHtml()}</div>
            <button type="button" class="btn-secundario" onclick="adicionarLinhaItem()"
                style="margin-top:6px;padding:6px 14px;font-size:13px">+ Adicionar item</button>
        </div>
    `, async () => {
        const itens = coletarItens();
        if (!itens.length) throw new Error('Adicione pelo menos um item.');
        await apiPost('/api/entregas-agricultor', {
            agricultor: { id: parseInt(document.getElementById('f-agricultor').value) },
            dataEntrega: document.getElementById('f-data').value,
            itens
        });
        fecharModal();
        await carregarEntregasAgr();
    });
}

function comprovanteEntregaAgr(id) {
    const e = ENTREGAS_AGR.find(x => x.id === id);
    const linhas = e.itens.map(i => `
        <tr>
            <td>${i.produto.nome}</td>
            <td>${fmtKg(i.quantidadeKg)}</td>
            <td>${fmtBRL(i.precoPraticado)}</td>
            <td>${fmtBRL(i.quantidadeKg * i.precoPraticado)}</td>
        </tr>`).join('');
    const total = e.itens.reduce((s, i) => s + i.quantidadeKg * i.precoPraticado, 0);

    imprimirHTML('Comprovante de Entrega', `
        <h2>COMPROVANTE DE ENTREGA</h2>
        <div class="sub">PMAA – Programa Municipal de Aquisição de Alimentos<br>Prefeitura Municipal de Barcarena – PA</div>
        <div class="info">
            <strong>Comprovante nº:</strong> ${String(e.id).padStart(6, '0')}<br>
            <strong>Agricultor(a):</strong> ${e.agricultor.nome}<br>
            <strong>CPF:</strong> ${e.agricultor.cpf} &nbsp;|&nbsp; <strong>DAP:</strong> ${e.agricultor.numeroDap}<br>
            <strong>Data da entrega:</strong> ${fmtData(e.dataEntrega)}
        </div>
        <table>
            <thead><tr><th>Produto</th><th>Quantidade</th><th>Preço/kg</th><th>Subtotal</th></tr></thead>
            <tbody>${linhas}</tbody>
        </table>
        <div class="total">VALOR TOTAL: ${fmtBRL(total)}</div>
        <div class="assinatura"><div class="linha">Assinatura do responsável pelo recebimento</div></div>
    `);
}
