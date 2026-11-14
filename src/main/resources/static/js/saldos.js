// RF05 - Saldo dos produtos vendidos: valor a receber discriminado por item
let SALDO_ATUAL = null;

registrarPagina('saldos', async function () {
    conteudo(`
        <div class="page-header">
            <div><h2>🧮 Saldo mensal do agricultor</h2>
            <div class="sub">Valor a receber, discriminado por produto entregue no período</div></div>
        </div>
        <div class="card">
            <div class="filtros">
                <div class="campo" style="min-width:240px"><label>Agricultor</label>
                    <select id="sd-agricultor"><option value="">Selecione...</option></select></div>
                ${seletorPeriodo('sd-mes', 'sd-ano')}
                <button class="btn-primary" onclick="consultarSaldo()">Calcular saldo</button>
            </div>
        </div>
        <div id="area-saldo"></div>`);

    AGRICULTORES = await apiGet('/api/agricultores');
    document.getElementById('sd-agricultor').innerHTML =
        '<option value="">Selecione...</option>' +
        AGRICULTORES.map(a => `<option value="${a.id}">${escapar(a.nome)}</option>`).join('');
});

async function consultarSaldo() {
    const agricultorId = document.getElementById('sd-agricultor').value;
    if (!agricultorId) { toast('Selecione um agricultor.', 'erro'); return; }

    const mes = parseInt(document.getElementById('sd-mes').value, 10);
    const ano = parseInt(document.getElementById('sd-ano').value, 10);
    const area = document.getElementById('area-saldo');
    area.innerHTML = '<div class="card">Calculando...</div>';

    try {
        SALDO_ATUAL = await apiGet(
            '/api/saldos/agricultor/' + agricultorId + '?mes=' + mes + '&ano=' + ano);
        area.innerHTML = htmlSaldo(SALDO_ATUAL);
    } catch (e) {
        area.innerHTML = '<div class="card"><p>' + escapar(e.message) + '</p></div>';
    }
}

function htmlSaldo(s) {
    if (!s.totalEntregas) {
        return '<div class="card"><h3>Nenhum recebimento no período</h3>' +
               '<p>Não há entregas registradas de <strong>' + escapar(s.agricultorNome) +
               '</strong> em ' + MESES[s.mes - 1] + ' de ' + s.ano + '.</p></div>';
    }

    const linhas = s.itens.map(i => `
        <tr>
            <td>${escapar(i.produto)}</td>
            <td class="num">${fmtNum(i.quantidadeKg)}</td>
            <td class="num">${fmtBRL(i.precoUnitario)}</td>
            <td class="num"><strong>${fmtBRL(i.subtotal)}</strong></td>
        </tr>`).join('');

    const situacao = s.pago
        ? '<span class="badge badge-verde">Pagamento autorizado em ' + fmtData(s.dataPagamento) + '</span>'
        : '<span class="badge badge-ambar">Aguardando autorização</span>';

    return `
        <div class="card">
            <div class="page-header" style="margin-bottom:12px">
                <div><h3>${escapar(s.agricultorNome)}</h3>
                <div class="sub">CPF ${escapar(s.cpf)} · DAP ${escapar(s.numeroDap)} ·
                    ${s.totalEntregas} entrega(s) em ${MESES[s.mes - 1]}/${s.ano}</div></div>
                <div>${situacao}
                    <button class="btn-secundario btn-pequeno" style="margin-left:8px"
                        onclick="demonstrativoSaldo()">🖨️ Demonstrativo</button></div>
            </div>
            <div class="tabela-wrap">
            <table class="tabela">
                <thead><tr>
                    <th>Produto</th><th class="num">Quantidade (kg)</th>
                    <th class="num">Preço por kg</th><th class="num">Valor a receber</th>
                </tr></thead>
                <tbody>${linhas}</tbody>
                <tfoot><tr>
                    <td>Total do período</td>
                    <td class="num">${fmtNum(s.quantidadeTotalKg)}</td>
                    <td class="num">—</td>
                    <td class="num">${fmtBRL(s.valorTotal)}</td>
                </tr></tfoot>
            </table></div>
        </div>`;
}

function demonstrativoSaldo() {
    const s = SALDO_ATUAL;
    if (!s) return;

    const linhas = s.itens.map(i => `
        <tr>
            <td>${escapar(i.produto)}</td>
            <td class="num">${fmtNum(i.quantidadeKg)}</td>
            <td class="num">${fmtBRL(i.precoUnitario)}</td>
            <td class="num">${fmtBRL(i.subtotal)}</td>
        </tr>`).join('');

    abrirDocumento('Demonstrativo de saldo', `
        <div class="documento">
            <h2>DEMONSTRATIVO DE SALDO MENSAL</h2>
            <div class="org">Integra PMAA – Programa Municipal de Aquisição de Alimentos<br>${ORGAO}</div>
            <div class="info">
                <strong>Agricultor(a):</strong> ${escapar(s.agricultorNome)}<br>
                <strong>CPF:</strong> ${escapar(s.cpf)} &nbsp;|&nbsp;
                <strong>DAP:</strong> ${escapar(s.numeroDap)}<br>
                <strong>Período de referência:</strong> ${MESES[s.mes - 1]} de ${s.ano}<br>
                <strong>Entregas no período:</strong> ${s.totalEntregas}<br>
                <strong>Situação:</strong> ${s.pago
                    ? 'Pagamento autorizado em ' + fmtData(s.dataPagamento)
                    : 'Aguardando autorização de pagamento'}
            </div>
            <table>
                <thead><tr>
                    <th>Produto</th><th class="num">Qtd. (kg)</th>
                    <th class="num">Preço/kg</th><th class="num">Valor a receber</th>
                </tr></thead>
                <tbody>${linhas}</tbody>
                <tfoot><tr>
                    <td>TOTAL</td><td class="num">${fmtNum(s.quantidadeTotalKg)}</td>
                    <td class="num">—</td><td class="num">${fmtBRL(s.valorTotal)}</td>
                </tr></tfoot>
            </table>
            <div class="total">VALOR TOTAL A RECEBER: ${fmtBRL(s.valorTotal)}</div>
            <div class="assinatura"><div class="linha">Assinatura do agricultor(a)</div></div>
            ${rodapeDocumento()}
        </div>
    `, 'doc-saldo');
}
