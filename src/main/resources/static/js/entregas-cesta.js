// RF04 - Entrega de cestas às entidades + comprovante
let ENTREGAS_CESTA = [];

registrarPagina('entregas-cesta', async function () {
    conteudo(`
        <div class="page-header">
            <div><h2>🧺 Entrega de cestas</h2>
            <div class="sub">Distribuição dos alimentos às entidades beneficiárias</div></div>
            <button class="btn-primary" onclick="abrirFormEntregaCesta()">+ Registrar entrega</button>
        </div>
        <div class="filtros">
            <div class="campo"><label>Filtrar por entidade</label>
                <select id="filtro-beneficiario" onchange="carregarEntregasCesta()">
                    <option value="">Todas as entidades</option>
                </select></div>
        </div>
        <div class="card"><div class="tabela-wrap">
            <table class="tabela">
                <thead><tr>
                    <th>Data</th><th>Entidade</th><th class="num">Cestas</th><th>Itens</th>
                    <th class="num">Quantidade</th><th>Registrado por</th><th></th>
                </tr></thead>
                <tbody id="tb-entregas-cesta"><tr><td colspan="7" class="vazio">Carregando...</td></tr></tbody>
            </table>
        </div></div>`);

    const [beneficiarios, produtos] = await Promise.all([
        apiGet('/api/beneficiarios'), apiGet('/api/produtos')
    ]);
    BENEFICIARIOS = beneficiarios;
    PRODUTOS = produtos;

    document.getElementById('filtro-beneficiario').innerHTML =
        '<option value="">Todas as entidades</option>' +
        BENEFICIARIOS.map(b => `<option value="${b.id}">${escapar(b.nome)}</option>`).join('');

    await carregarEntregasCesta();
});

async function carregarEntregasCesta() {
    const filtro = document.getElementById('filtro-beneficiario').value;
    ENTREGAS_CESTA = await apiGet('/api/entregas-cesta' + (filtro ? '?beneficiarioId=' + filtro : ''));

    const tb = document.getElementById('tb-entregas-cesta');
    if (!ENTREGAS_CESTA.length) {
        tb.innerHTML = '<tr><td colspan="7" class="vazio">Nenhuma entrega registrada.</td></tr>';
        return;
    }
    tb.innerHTML = ENTREGAS_CESTA.map(e => {
        const kg = e.itens.reduce((s, i) => s + i.quantidadeKg, 0);
        return `
        <tr>
            <td>${fmtData(e.dataEntrega)}</td>
            <td><strong>${escapar(e.beneficiario.nome)}</strong></td>
            <td class="num">${e.quantidadeCestas}</td>
            <td>${e.itens.length}</td>
            <td class="num">${fmtKg(kg)}</td>
            <td>${escapar(e.registradoPor ? e.registradoPor.nome : '') || '—'}</td>
            <td class="acoes">
                <button class="btn-icone" title="Comprovante" onclick="comprovanteEntregaCesta(${e.id})">🖨️</button>
                <button class="btn-icone" title="Excluir" onclick="excluirEntregaCesta(${e.id})">🗑️</button>
            </td>
        </tr>`;
    }).join('');
}

function abrirFormEntregaCesta() {
    if (!BENEFICIARIOS.length) { toast('Cadastre uma entidade beneficiária antes.', 'erro'); return; }
    if (!PRODUTOS.length) { toast('Cadastre produtos antes.', 'erro'); return; }

    abrirModal('Registrar entrega de cestas', `
        <div class="linha-3">
            <div class="campo"><label>Entidade beneficiária *</label>
                <select id="f-beneficiario" required>
                    <option value="">Selecione...</option>
                    ${BENEFICIARIOS.map(b => `<option value="${b.id}">${escapar(b.nome)}</option>`).join('')}
                </select></div>
            <div class="campo"><label>Data da entrega *</label>
                <input type="date" id="f-data" value="${hojeISO()}" max="${hojeISO()}" required></div>
            <div class="campo"><label>Nº de cestas</label>
                <input type="number" id="f-cestas" value="1" min="1" step="1"></div>
        </div>
        <div class="campo">
            <label>Itens da cesta *</label>
            <div id="itens-container">${linhaItemHtml()}</div>
            <button type="button" class="btn-secundario btn-pequeno" style="margin-top:6px"
                onclick="adicionarLinhaItem()">+ Adicionar item</button>
            <div class="ajuda">O comprovante da entidade não exibe valores financeiros.</div>
        </div>
    `, async () => {
        const dados = {
            beneficiario: { id: parseInt(document.getElementById('f-beneficiario').value, 10) },
            dataEntrega: document.getElementById('f-data').value,
            quantidadeCestas: parseInt(document.getElementById('f-cestas').value, 10) || 1,
            itens: coletarItens()
        };
        const criada = await apiPost('/api/entregas-cesta', dados);
        fecharModal();
        toast('Entrega registrada.', 'sucesso');
        await carregarEntregasCesta();
        setTimeout(() => comprovanteEntregaCesta(criada.id), 250);
    }, { largo: true });
}

async function excluirEntregaCesta(id) {
    if (!confirm('Excluir esta entrega de cestas?')) return;
    try {
        await apiDelete('/api/entregas-cesta/' + id);
        toast('Entrega excluída.', 'sucesso');
        await carregarEntregasCesta();
    } catch (e) { toast(e.message, 'erro'); }
}

// ===== RF04: comprovante de entrega de cesta (sem valores) =====
function comprovanteEntregaCesta(id) {
    const e = ENTREGAS_CESTA.find(x => x.id === id);
    if (!e) return;

    const linhas = e.itens.map(i => `
        <tr>
            <td>${escapar(i.produto ? i.produto.nome : 'Produto removido')}</td>
            <td class="num">${fmtNum(i.quantidadeKg)}</td>
        </tr>`).join('');
    const totalKg = e.itens.reduce((s, i) => s + i.quantidadeKg, 0);

    abrirDocumento('Comprovante de entrega de cestas', `
        <div class="documento">
            <h2>COMPROVANTE DE ENTREGA DE CESTAS</h2>
            <div class="org">Integra PMAA – Programa Municipal de Aquisição de Alimentos<br>${ORGAO}</div>
            <div class="info">
                <strong>Comprovante nº:</strong> ${String(e.id).padStart(6, '0')}<br>
                <strong>Entidade:</strong> ${escapar(e.beneficiario.nome)}<br>
                <strong>Responsável:</strong> ${escapar(e.beneficiario.responsavel)}<br>
                <strong>Data da entrega:</strong> ${fmtData(e.dataEntrega)}<br>
                <strong>Quantidade de cestas:</strong> ${e.quantidadeCestas}<br>
                <strong>Entregue por:</strong> ${escapar(e.registradoPor ? e.registradoPor.nome : '—')}
            </div>
            <table>
                <thead><tr><th>Produto</th><th class="num">Quantidade (kg)</th></tr></thead>
                <tbody>${linhas}</tbody>
                <tfoot><tr><td>Total</td><td class="num">${fmtNum(totalKg)}</td></tr></tfoot>
            </table>
            <div class="assinatura"><div class="linha">Assinatura do responsável pela entidade</div></div>
            ${rodapeDocumento()}
        </div>
    `, 'doc-comprovante-cesta');
}
