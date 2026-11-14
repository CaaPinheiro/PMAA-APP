// Autorização de pagamentos - restrito a administradores
let PAGAMENTOS = [], SALDO_PREVIA = null;

registrarPagina('pagamentos', async function () {
    conteudo(`
        <div class="page-header">
            <div><h2>💰 Pagamentos</h2>
            <div class="sub">Autorização do saldo mensal apurado para cada agricultor</div></div>
        </div>
        <div class="card">
            <h3>Autorizar pagamento</h3>
            <div class="filtros">
                <div class="campo" style="min-width:240px"><label>Agricultor</label>
                    <select id="pg-agricultor"><option value="">Selecione...</option></select></div>
                ${seletorPeriodo('pg-mes', 'pg-ano')}
                <button class="btn-secundario" onclick="previaPagamento()">Conferir saldo</button>
            </div>
            <div id="previa-pagamento"></div>
        </div>
        <div class="card">
            <h3>Pagamentos autorizados</h3>
            <div class="tabela-wrap">
            <table class="tabela">
                <thead><tr>
                    <th>Autorizado em</th><th>Agricultor</th><th>Referência</th>
                    <th class="num">Entregas</th><th class="num">Quantidade</th>
                    <th class="num">Valor</th><th>Autorizado por</th><th></th>
                </tr></thead>
                <tbody id="tb-pagamentos"><tr><td colspan="8" class="vazio">Carregando...</td></tr></tbody>
            </table></div>
        </div>`);

    AGRICULTORES = await apiGet('/api/agricultores');
    document.getElementById('pg-agricultor').innerHTML =
        '<option value="">Selecione...</option>' +
        AGRICULTORES.map(a => `<option value="${a.id}">${escapar(a.nome)}</option>`).join('');

    await carregarPagamentos();
});

async function carregarPagamentos() {
    PAGAMENTOS = await apiGet('/api/pagamentos');
    const tb = document.getElementById('tb-pagamentos');
    if (!tb) return;

    if (!PAGAMENTOS.length) {
        tb.innerHTML = '<tr><td colspan="8" class="vazio">Nenhum pagamento autorizado.</td></tr>';
        return;
    }
    tb.innerHTML = PAGAMENTOS.map(p => `
        <tr>
            <td>${fmtData(p.dataPagamento)}</td>
            <td><strong>${escapar(p.agricultor.nome)}</strong></td>
            <td>${MESES[p.mesReferencia - 1]}/${p.anoReferencia}</td>
            <td class="num">${p.totalEntregas}</td>
            <td class="num">${fmtKg(p.quantidadeTotalKg)}</td>
            <td class="num"><strong>${fmtBRL(p.valorTotal)}</strong></td>
            <td>${escapar(p.autorizadoPor ? p.autorizadoPor.nome : '') || '—'}</td>
            <td class="acoes">
                <button class="btn-icone" title="Comprovante" onclick="comprovantePagamento(${p.id})">🖨️</button>
                <button class="btn-icone" title="Cancelar autorização" onclick="cancelarPagamento(${p.id})">↩️</button>
            </td>
        </tr>`).join('');
}

async function previaPagamento() {
    const agricultorId = document.getElementById('pg-agricultor').value;
    if (!agricultorId) { toast('Selecione um agricultor.', 'erro'); return; }

    const mes = parseInt(document.getElementById('pg-mes').value, 10);
    const ano = parseInt(document.getElementById('pg-ano').value, 10);
    const area = document.getElementById('previa-pagamento');
    area.innerHTML = '<p style="color:var(--texto-suave)">Calculando...</p>';

    try {
        SALDO_PREVIA = await apiGet(
            '/api/saldos/agricultor/' + agricultorId + '?mes=' + mes + '&ano=' + ano);
        const s = SALDO_PREVIA;

        if (!s.totalEntregas) {
            area.innerHTML = '<div class="aviso">Nenhuma entrega registrada para ' +
                escapar(s.agricultorNome) + ' em ' + MESES[mes - 1] + '/' + ano + '.</div>';
            return;
        }
        if (s.pago) {
            area.innerHTML = '<div class="aviso">O pagamento deste agricultor para ' +
                MESES[mes - 1] + '/' + ano + ' já foi autorizado em ' + fmtData(s.dataPagamento) + '.</div>';
            return;
        }

        const linhas = s.itens.map(i => `
            <tr>
                <td>${escapar(i.produto)}</td>
                <td class="num">${fmtNum(i.quantidadeKg)}</td>
                <td class="num">${fmtBRL(i.precoUnitario)}</td>
                <td class="num">${fmtBRL(i.subtotal)}</td>
            </tr>`).join('');

        area.innerHTML = `
            <div class="tabela-wrap"><table class="tabela">
                <thead><tr>
                    <th>Produto</th><th class="num">Qtd. (kg)</th>
                    <th class="num">Preço/kg</th><th class="num">Valor</th>
                </tr></thead>
                <tbody>${linhas}</tbody>
                <tfoot><tr>
                    <td>Total (${s.totalEntregas} entrega(s))</td>
                    <td class="num">${fmtNum(s.quantidadeTotalKg)}</td>
                    <td class="num">—</td>
                    <td class="num">${fmtBRL(s.valorTotal)}</td>
                </tr></tfoot>
            </table></div>
            <div class="aviso" style="margin-top:12px">
                Depois de autorizado, o período fica travado: não será possível
                incluir ou excluir entregas deste agricultor em ${MESES[mes - 1]}/${ano}.
            </div>
            <button class="btn-primary" onclick="autorizarPagamento()">
                ✓ Autorizar pagamento de ${fmtBRL(s.valorTotal)}</button>`;
    } catch (e) {
        area.innerHTML = '<div class="aviso">' + escapar(e.message) + '</div>';
    }
}

async function autorizarPagamento() {
    const s = SALDO_PREVIA;
    if (!s) return;
    if (!confirm('Autorizar o pagamento de ' + fmtBRL(s.valorTotal) + ' para ' +
                 s.agricultorNome + ', referente a ' + MESES[s.mes - 1] + '/' + s.ano + '?')) return;

    try {
        const pg = await apiPost('/api/pagamentos/autorizar', {
            agricultorId: s.agricultorId, mes: s.mes, ano: s.ano
        });
        toast('Pagamento autorizado: ' + fmtBRL(pg.valorTotal), 'sucesso');
        document.getElementById('previa-pagamento').innerHTML = '';
        SALDO_PREVIA = null;
        await carregarPagamentos();
        setTimeout(() => comprovantePagamento(pg.id), 250);
    } catch (e) { toast(e.message, 'erro'); }
}

async function cancelarPagamento(id) {
    const p = PAGAMENTOS.find(x => x.id === id);
    if (!confirm('Cancelar a autorização do pagamento de ' + p.agricultor.nome + '?\n\n' +
                 'O período volta a aceitar alterações nas entregas.')) return;
    try {
        await apiDelete('/api/pagamentos/' + id);
        toast('Autorização cancelada.', 'sucesso');
        await carregarPagamentos();
    } catch (e) { toast(e.message, 'erro'); }
}

function comprovantePagamento(id) {
    const p = PAGAMENTOS.find(x => x.id === id);
    if (!p) return;

    apiGet('/api/saldos/agricultor/' + p.agricultor.id +
           '?mes=' + p.mesReferencia + '&ano=' + p.anoReferencia)
        .then(s => {
            const linhas = s.itens.map(i => `
                <tr>
                    <td>${escapar(i.produto)}</td>
                    <td class="num">${fmtNum(i.quantidadeKg)}</td>
                    <td class="num">${fmtBRL(i.precoUnitario)}</td>
                    <td class="num">${fmtBRL(i.subtotal)}</td>
                </tr>`).join('');

            abrirDocumento('Comprovante de pagamento', `
                <div class="documento">
                    <h2>COMPROVANTE DE PAGAMENTO</h2>
                    <div class="org">Integra PMAA – Programa Municipal de Aquisição de Alimentos<br>${ORGAO}</div>
                    <div class="info">
                        <strong>Comprovante nº:</strong> ${String(p.id).padStart(6, '0')}<br>
                        <strong>Agricultor(a):</strong> ${escapar(p.agricultor.nome)}<br>
                        <strong>CPF:</strong> ${escapar(p.agricultor.cpf)} &nbsp;|&nbsp;
                        <strong>DAP:</strong> ${escapar(p.agricultor.numeroDap)}<br>
                        <strong>Período de referência:</strong> ${MESES[p.mesReferencia - 1]} de ${p.anoReferencia}<br>
                        <strong>Entregas no período:</strong> ${p.totalEntregas}<br>
                        <strong>Data da autorização:</strong> ${fmtData(p.dataPagamento)}<br>
                        <strong>Autorizado por:</strong> ${escapar(p.autorizadoPor ? p.autorizadoPor.nome : '—')}
                    </div>
                    <table>
                        <thead><tr>
                            <th>Produto</th><th class="num">Qtd. (kg)</th>
                            <th class="num">Preço/kg</th><th class="num">Valor</th>
                        </tr></thead>
                        <tbody>${linhas}</tbody>
                        <tfoot><tr>
                            <td>TOTAL</td><td class="num">${fmtNum(p.quantidadeTotalKg)}</td>
                            <td class="num">—</td><td class="num">${fmtBRL(p.valorTotal)}</td>
                        </tr></tfoot>
                    </table>
                    <div class="total">VALOR TOTAL PAGO: ${fmtBRL(p.valorTotal)}</div>
                    <div class="assinatura"><div class="linha">Assinatura do agricultor(a)</div></div>
                    <div class="assinatura"><div class="linha">Assinatura do responsável pela SEMAS</div></div>
                    ${rodapeDocumento()}
                </div>
            `, 'doc-pagamento');
        })
        .catch(e => toast(e.message, 'erro'));
}
