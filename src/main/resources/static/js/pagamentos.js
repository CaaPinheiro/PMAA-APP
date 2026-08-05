let PAGAMENTOS = [];

async function paginaPagamentos() {
    const anoAtual = new Date().getFullYear();
    conteudo(`
        <div class="page-header">
            <h2>💰 Pagamentos</h2>
        </div>
        <div class="card">
            <h3 style="margin-bottom:12px">Gerar pagamento mensal</h3>
            <p style="color:var(--texto-suave);font-size:13px;margin-bottom:14px">
                O sistema consolida todas as entregas do agricultor no período e calcula o valor total automaticamente.
            </p>
            <div class="linha-3">
                <div class="campo"><label>Agricultor</label>
                    <select id="pg-agricultor"><option value="">Selecione...</option></select></div>
                <div class="campo"><label>Mês de referência</label>
                    <select id="pg-mes">${MESES.map((m, i) =>
                        `<option value="${i + 1}" ${i === new Date().getMonth() ? 'selected' : ''}>${m}</option>`).join('')}
                    </select></div>
                <div class="campo"><label>Ano</label>
                    <input type="number" id="pg-ano" value="${anoAtual}" min="2020" max="2100"></div>
            </div>
            <button class="btn-primary" onclick="gerarPagamento()">Gerar Pagamento</button>
        </div>
        <div class="card">
            <h3 style="margin-bottom:12px">Pagamentos realizados</h3>
            <table class="tabela">
                <thead><tr>
                    <th>Data</th><th>Agricultor</th><th>Referência</th><th>Entregas</th><th>Valor</th><th>Autorizado por</th><th></th>
                </tr></thead>
                <tbody id="tb-pagamentos"><tr><td colspan="7" class="vazio">Carregando...</td></tr></tbody>
            </table>
        </div>`);

    AGRICULTORES = await apiGet('/api/agricultores');
    document.getElementById('pg-agricultor').innerHTML =
        '<option value="">Selecione...</option>' +
        AGRICULTORES.map(a => `<option value="${a.id}">${a.nome}</option>`).join('');

    await carregarPagamentos();
}

async function carregarPagamentos() {
    PAGAMENTOS = await apiGet('/api/pagamentos');
    const tb = document.getElementById('tb-pagamentos');
    if (!PAGAMENTOS.length) {
        tb.innerHTML = '<tr><td colspan="7" class="vazio">Nenhum pagamento gerado</td></tr>';
        return;
    }
    tb.innerHTML = PAGAMENTOS.map(p => `
        <tr>
            <td>${fmtData(p.dataPagamento)}</td>
            <td><strong>${p.agricultor.nome}</strong></td>
            <td>${MESES[p.mesReferencia - 1]}/${p.anoReferencia}</td>
            <td>${(p.entregas || []).length} entrega(s)</td>
            <td><strong>${fmtBRL(p.valorTotal)}</strong></td>
            <td>${p.autorizadoPor ? p.autorizadoPor.nome : '-'}</td>
            <td class="acoes">
                <button class="btn-icone" title="Imprimir comprovante"
                    onclick="comprovantePagamento(${p.id})">🖨️</button>
            </td>
        </tr>`).join('');
}

async function gerarPagamento() {
    const agricultorId = document.getElementById('pg-agricultor').value;
    if (!agricultorId) { alert('Selecione um agricultor.'); return; }

    const mes = parseInt(document.getElementById('pg-mes').value);
    const ano = parseInt(document.getElementById('pg-ano').value);
    const nomeAgr = AGRICULTORES.find(a => a.id == agricultorId).nome;

    if (!confirm('Gerar pagamento de ' + nomeAgr + ' referente a ' +
        MESES[mes - 1] + '/' + ano + '?')) return;

    try {
        const pg = await apiPost('/api/pagamentos/gerar', {
            agricultorId: parseInt(agricultorId),
            mes, ano,
            adminId: usuarioAtual().id
        });
        alert('✅ Pagamento gerado!\nValor total: ' + fmtBRL(pg.valorTotal));
        await carregarPagamentos();
    } catch (err) {
        alert('⚠️ ' + err.message);
    }
}

function comprovantePagamento(id) {
    const p = PAGAMENTOS.find(x => x.id === id);
    const linhas = (p.entregas || []).map(e => {
        const valor = e.itens.reduce((s, i) => s + i.quantidadeKg * i.precoPraticado, 0);
        const kg = e.itens.reduce((s, i) => s + i.quantidadeKg, 0);
        return `<tr><td>${fmtData(e.dataEntrega)}</td><td>${e.itens.length} item(ns)</td>
                <td>${fmtKg(kg)}</td><td>${fmtBRL(valor)}</td></tr>`;
    }).join('');

    imprimirHTML('Comprovante de Pagamento', `
        <h2>COMPROVANTE DE PAGAMENTO</h2>
        <div class="sub">PMAA – Programa Municipal de Aquisição de Alimentos<br>Prefeitura Municipal de Barcarena – PA</div>
        <div class="info">
            <strong>Comprovante nº:</strong> ${String(p.id).padStart(6, '0')}<br>
            <strong>Agricultor(a):</strong> ${p.agricultor.nome}<br>
            <strong>CPF:</strong> ${p.agricultor.cpf} &nbsp;|&nbsp; <strong>DAP:</strong> ${p.agricultor.numeroDap}<br>
            <strong>Período de referência:</strong> ${MESES[p.mesReferencia - 1]} de ${p.anoReferencia}<br>
            <strong>Data do pagamento:</strong> ${fmtData(p.dataPagamento)}<br>
            <strong>Autorizado por:</strong> ${p.autorizadoPor ? p.autorizadoPor.nome : '-'}
        </div>
        <table>
            <thead><tr><th>Data da entrega</th><th>Itens</th><th>Total Kg</th><th>Valor</th></tr></thead>
            <tbody>${linhas}</tbody>
        </table>
        <div class="total">VALOR TOTAL PAGO: ${fmtBRL(p.valorTotal)}</div>
        <div class="assinatura"><div class="linha">Assinatura do agricultor(a)</div></div>
    `);
}
