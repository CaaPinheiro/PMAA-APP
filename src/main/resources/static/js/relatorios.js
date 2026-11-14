// RF08 - Geração de relatórios mensais (impressão / exportação em PDF)
registrarPagina('relatorios', async function () {
    conteudo(`
        <div class="page-header">
            <div><h2>📄 Relatórios mensais</h2>
            <div class="sub">Consolidação do período, pronta para impressão ou exportação em PDF</div></div>
        </div>
        <div class="card">
            <div class="filtros">
                <div class="campo" style="min-width:250px"><label>Tipo de relatório</label>
                    <select id="rel-tipo">
                        <option value="agricultores">Recebimentos de agricultores</option>
                        <option value="cestas">Distribuição de cestas</option>
                    </select></div>
                ${seletorPeriodo('rel-mes', 'rel-ano')}
                <button class="btn-primary" onclick="gerarRelatorio()">Gerar relatório</button>
            </div>
            <div class="ajuda" style="color:var(--texto-suave);font-size:13px">
                Para salvar em PDF, clique em imprimir e escolha o destino
                “Salvar como PDF” (ou “Microsoft Print to PDF”).
            </div>
        </div>
        <div id="area-relatorio"></div>`);
});

async function gerarRelatorio() {
    const tipo = document.getElementById('rel-tipo').value;
    const mes = parseInt(document.getElementById('rel-mes').value, 10);
    const ano = parseInt(document.getElementById('rel-ano').value, 10);
    const area = document.getElementById('area-relatorio');
    area.innerHTML = '<div class="card">Gerando...</div>';

    try {
        if (tipo === 'agricultores') {
            const r = await apiGet('/api/relatorios/entregas-agricultores?mes=' + mes + '&ano=' + ano);
            area.innerHTML = '<div class="card"><div id="doc-relatorio">'
                + htmlRelatorioAgricultores(r) + '</div>'
                + botoesRelatorio('Relatório de recebimentos') + '</div>';
        } else {
            const r = await apiGet('/api/relatorios/distribuicao-cestas?mes=' + mes + '&ano=' + ano);
            area.innerHTML = '<div class="card"><div id="doc-relatorio">'
                + htmlRelatorioCestas(r) + '</div>'
                + botoesRelatorio('Relatório de distribuição') + '</div>';
        }
    } catch (e) {
        area.innerHTML = '<div class="card"><p>' + escapar(e.message) + '</p></div>';
    }
}

function botoesRelatorio(titulo) {
    return '<div class="modal-acoes nao-imprimir">' +
        '<button class="btn-primary" onclick="imprimirElemento(\'doc-relatorio\', \'' + titulo + '\')">' +
        '🖨️ Imprimir / Salvar em PDF</button></div>';
}

function htmlRelatorioAgricultores(r) {
    if (!r.totalAgricultores) {
        return '<div class="documento"><h2>RELATÓRIO DE RECEBIMENTOS</h2>' +
               '<div class="org">' + MESES[r.mes - 1] + ' de ' + r.ano + '</div>' +
               '<p style="text-align:center;color:#666">Nenhum recebimento registrado neste período.</p></div>';
    }

    // Detalhamento por agricultor
    const blocos = r.agricultores.map(s => {
        const itens = s.itens.map(i => `
            <tr>
                <td>${escapar(i.produto)}</td>
                <td class="num">${fmtNum(i.quantidadeKg)}</td>
                <td class="num">${fmtBRL(i.precoUnitario)}</td>
                <td class="num">${fmtBRL(i.subtotal)}</td>
            </tr>`).join('');
        return `
            <h4>${escapar(s.agricultorNome)} — CPF ${escapar(s.cpf)} · DAP ${escapar(s.numeroDap)}
                ${s.pago ? ' · pagamento autorizado' : ''}</h4>
            <table>
                <thead><tr>
                    <th>Produto</th><th class="num">Qtd. (kg)</th>
                    <th class="num">Preço/kg</th><th class="num">Valor</th>
                </tr></thead>
                <tbody>${itens}</tbody>
                <tfoot><tr>
                    <td>Subtotal (${s.totalEntregas} entrega(s))</td>
                    <td class="num">${fmtNum(s.quantidadeTotalKg)}</td>
                    <td class="num">—</td>
                    <td class="num">${fmtBRL(s.valorTotal)}</td>
                </tr></tfoot>
            </table>`;
    }).join('');

    // Consolidado por produto
    const totais = r.totaisPorProduto.map(i => `
        <tr>
            <td>${escapar(i.produto)}</td>
            <td class="num">${fmtNum(i.quantidadeKg)}</td>
            <td class="num">${fmtBRL(i.precoUnitario)}</td>
            <td class="num">${fmtBRL(i.subtotal)}</td>
        </tr>`).join('');

    return `
        <div class="documento">
            <h2>RELATÓRIO MENSAL DE RECEBIMENTOS DE AGRICULTORES</h2>
            <div class="org">Integra PMAA – Programa Municipal de Aquisição de Alimentos<br>${ORGAO}</div>
            <div class="info">
                <strong>Período de referência:</strong> ${MESES[r.mes - 1]} de ${r.ano}<br>
                <strong>Agricultores atendidos:</strong> ${r.totalAgricultores} &nbsp;|&nbsp;
                <strong>Entregas registradas:</strong> ${r.totalEntregas}<br>
                <strong>Quantidade total recebida:</strong> ${fmtKg(r.quantidadeTotalKg)}<br>
                <strong>Valor total do período:</strong> ${fmtBRL(r.valorTotalGeral)}
            </div>

            <h4>1. Consolidado por produto</h4>
            <table>
                <thead><tr>
                    <th>Produto</th><th class="num">Qtd. total (kg)</th>
                    <th class="num">Preço médio/kg</th><th class="num">Valor total</th>
                </tr></thead>
                <tbody>${totais}</tbody>
                <tfoot><tr>
                    <td>TOTAL GERAL</td>
                    <td class="num">${fmtNum(r.quantidadeTotalKg)}</td>
                    <td class="num">—</td>
                    <td class="num">${fmtBRL(r.valorTotalGeral)}</td>
                </tr></tfoot>
            </table>

            <h4>2. Detalhamento por agricultor</h4>
            ${blocos}

            <div class="total">VALOR TOTAL DO PERÍODO: ${fmtBRL(r.valorTotalGeral)}</div>
            <div class="assinatura"><div class="linha">Responsável pela SEMAS</div></div>
            ${rodapeDocumento()}
        </div>`;
}

function htmlRelatorioCestas(r) {
    if (!r.totalBeneficiarios) {
        return '<div class="documento"><h2>RELATÓRIO DE DISTRIBUIÇÃO</h2>' +
               '<div class="org">' + MESES[r.mes - 1] + ' de ' + r.ano + '</div>' +
               '<p style="text-align:center;color:#666">Nenhuma entrega registrada neste período.</p></div>';
    }

    const blocos = r.beneficiarios.map(b => {
        const itens = b.itens.map(i => `
            <tr><td>${escapar(i.produto)}</td><td class="num">${fmtNum(i.quantidadeKg)}</td></tr>`).join('');
        return `
            <h4>${escapar(b.beneficiarioNome)} — responsável: ${escapar(b.responsavel)}</h4>
            <table>
                <thead><tr><th>Produto</th><th class="num">Qtd. (kg)</th></tr></thead>
                <tbody>${itens}</tbody>
                <tfoot><tr>
                    <td>Subtotal (${b.totalEntregas} entrega(s) · ${b.totalCestas} cesta(s))</td>
                    <td class="num">${fmtNum(b.quantidadeTotalKg)}</td>
                </tr></tfoot>
            </table>`;
    }).join('');

    const totais = r.totaisPorProduto.map(i => `
        <tr><td>${escapar(i.produto)}</td><td class="num">${fmtNum(i.quantidadeKg)}</td></tr>`).join('');

    return `
        <div class="documento">
            <h2>RELATÓRIO MENSAL DE DISTRIBUIÇÃO DE CESTAS</h2>
            <div class="org">Integra PMAA – Programa Municipal de Aquisição de Alimentos<br>${ORGAO}</div>
            <div class="info">
                <strong>Período de referência:</strong> ${MESES[r.mes - 1]} de ${r.ano}<br>
                <strong>Entidades atendidas:</strong> ${r.totalBeneficiarios} &nbsp;|&nbsp;
                <strong>Entregas realizadas:</strong> ${r.totalEntregas}<br>
                <strong>Cestas distribuídas:</strong> ${r.totalCestas}<br>
                <strong>Quantidade total distribuída:</strong> ${fmtKg(r.quantidadeTotalKg)}
            </div>

            <h4>1. Consolidado por produto</h4>
            <table>
                <thead><tr><th>Produto</th><th class="num">Qtd. total (kg)</th></tr></thead>
                <tbody>${totais}</tbody>
                <tfoot><tr><td>TOTAL GERAL</td>
                    <td class="num">${fmtNum(r.quantidadeTotalKg)}</td></tr></tfoot>
            </table>

            <h4>2. Detalhamento por entidade</h4>
            ${blocos}

            <div class="assinatura"><div class="linha">Responsável pela SEMAS</div></div>
            ${rodapeDocumento()}
        </div>`;
}
