let ENTREGAS_CESTA = [];

async function paginaEntregasCesta() {
    conteudo(`
        <div class="page-header">
            <h2>🧺 Entregas de Cestas</h2>
            <button class="btn-primary" onclick="abrirFormEntregaCesta()">+ Registrar Entrega</button>
        </div>
        <div class="filtros">
            <label>Filtrar por entidade:</label>
            <select id="filtro-beneficiario" onchange="carregarEntregasCesta()">
                <option value="">Todas</option>
            </select>
        </div>
        <div class="card">
            <table class="tabela">
                <thead><tr>
                    <th>Data</th><th>Entidade</th><th>Itens</th><th>Total Kg</th><th>Registrado por</th><th></th>
                </tr></thead>
                <tbody id="tb-entregas-cesta"><tr><td colspan="6" class="vazio">Carregando...</td></tr></tbody>
            </table>
        </div>`);

    [BENEFICIARIOS, PRODUTOS] = await Promise.all([
        apiGet('/api/beneficiarios'),
        apiGet('/api/produtos')
    ]);
    document.getElementById('filtro-beneficiario').innerHTML =
        '<option value="">Todas</option>' +
        BENEFICIARIOS.map(b => `<option value="${b.id}">${b.nome}</option>`).join('');

    await carregarEntregasCesta();
}

async function carregarEntregasCesta() {
    const filtro = document.getElementById('filtro-beneficiario').value;
    ENTREGAS_CESTA = filtro
        ? await apiGet('/api/entregas-cesta/beneficiario/' + filtro)
        : await apiGet('/api/entregas-cesta');

    const tb = document.getElementById('tb-entregas-cesta');
    if (!ENTREGAS_CESTA.length) {
        tb.innerHTML = '<tr><td colspan="6" class="vazio">Nenhuma entrega registrada</td></tr>';
        return;
    }
    tb.innerHTML = ENTREGAS_CESTA.map(e => {
        const totalKg = e.itens.reduce((s, i) => s + i.quantidadeKg, 0);
        return `
        <tr>
            <td>${fmtData(e.dataEntrega)}</td>
            <td><strong>${e.beneficiario.nome}</strong></td>
            <td>${e.itens.length} item(ns)</td>
            <td>${fmtKg(totalKg)}</td>
            <td>${e.registradoPor ? e.registradoPor.nome : '-'}</td>
            <td class="acoes">
                <button class="btn-icone" title="Imprimir comprovante"
                    onclick="comprovanteEntregaCesta(${e.id})">🖨️</button>
            </td>
        </tr>`;
    }).join('');
}

function abrirFormEntregaCesta() {
    if (!BENEFICIARIOS.length) { alert('Cadastre pelo menos uma entidade beneficiária primeiro.'); return; }
    if (!PRODUTOS.length) { alert('Cadastre pelo menos um produto primeiro.'); return; }

    abrirModal('Registrar Entrega de Cesta', `
        <div class="linha-2">
            <div class="campo"><label>Entidade beneficiária *</label>
                <select id="f-beneficiario" required>
                    <option value="">Selecione...</option>
                    ${BENEFICIARIOS.map(b => `<option value="${b.id}">${b.nome}</option>`).join('')}
                </select></div>
            <div class="campo"><label>Data da entrega *</label>
                <input type="date" id="f-data" value="${new Date().toISOString().slice(0, 10)}" required></div>
        </div>
        <div class="campo">
            <label>Itens da cesta *</label>
            <div id="itens-container">${linhaItemHtml()}</div>
            <button type="button" class="btn-secundario" onclick="adicionarLinhaItem()"
                style="margin-top:6px;padding:6px 14px;font-size:13px">+ Adicionar item</button>
        </div>
    `, async () => {
        const itens = coletarItens().map(i => ({ produto: i.produto, quantidadeKg: i.quantidadeKg }));
        if (!itens.length) throw new Error('Adicione pelo menos um item.');
        await apiPost('/api/entregas-cesta', {
            beneficiario: { id: parseInt(document.getElementById('f-beneficiario').value) },
            registradoPor: { id: usuarioAtual().id },
            dataEntrega: document.getElementById('f-data').value,
            itens
        });
        fecharModal();
        await carregarEntregasCesta();
    });
}

function comprovanteEntregaCesta(id) {
    const e = ENTREGAS_CESTA.find(x => x.id === id);
    // Regra de negócio: comprovante de cesta NÃO exibe preços
    const linhas = e.itens.map(i => `
        <tr>
            <td>${i.produto.nome}</td>
            <td>${fmtKg(i.quantidadeKg)}</td>
        </tr>`).join('');
    const totalKg = e.itens.reduce((s, i) => s + i.quantidadeKg, 0);

    imprimirHTML('Comprovante de Recebimento', `
        <h2>COMPROVANTE DE RECEBIMENTO DE CESTA</h2>
        <div class="sub">PMAA – Programa Municipal de Aquisição de Alimentos<br>Prefeitura Municipal de Barcarena – PA</div>
        <div class="info">
            <strong>Comprovante nº:</strong> ${String(e.id).padStart(6, '0')}<br>
            <strong>Entidade:</strong> ${e.beneficiario.nome}<br>
            <strong>Responsável:</strong> ${e.beneficiario.responsavel}<br>
            <strong>Data da entrega:</strong> ${fmtData(e.dataEntrega)}<br>
            <strong>Registrado por:</strong> ${e.registradoPor ? e.registradoPor.nome : '-'}
        </div>
        <table>
            <thead><tr><th>Produto</th><th>Quantidade</th></tr></thead>
            <tbody>${linhas}</tbody>
        </table>
        <div class="total">TOTAL: ${fmtKg(totalKg)}</div>
        <div class="assinatura"><div class="linha">Assinatura do responsável pela entidade</div></div>
    `);
}
