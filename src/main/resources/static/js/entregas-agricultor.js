// RF06 - Recebimento de produtos dos agricultores + comprovante
let ENTREGAS_AGR = [];

registrarPagina('entregas-agricultor', async function () {
    conteudo(`
        <div class="page-header">
            <div><h2>📦 Recebimentos de agricultores</h2>
            <div class="sub">Registro dos produtos entregues ao programa</div></div>
            <button class="btn-primary" onclick="abrirFormEntregaAgr()">+ Registrar recebimento</button>
        </div>
        <div class="filtros">
            <div class="campo"><label>Filtrar por agricultor</label>
                <select id="filtro-agricultor" onchange="carregarEntregasAgr()">
                    <option value="">Todos os agricultores</option>
                </select></div>
        </div>
        <div class="card"><div class="tabela-wrap">
            <table class="tabela">
                <thead><tr>
                    <th>Data</th><th>Agricultor</th><th>Itens</th>
                    <th class="num">Quantidade</th><th class="num">Valor</th>
                    <th>Registrado por</th><th></th>
                </tr></thead>
                <tbody id="tb-entregas-agr"><tr><td colspan="7" class="vazio">Carregando...</td></tr></tbody>
            </table>
        </div></div>`);

    const [agricultores, produtos] = await Promise.all([
        apiGet('/api/agricultores'), apiGet('/api/produtos')
    ]);
    AGRICULTORES = agricultores;
    PRODUTOS = produtos;

    document.getElementById('filtro-agricultor').innerHTML =
        '<option value="">Todos os agricultores</option>' +
        AGRICULTORES.map(a => `<option value="${a.id}">${escapar(a.nome)}</option>`).join('');

    await carregarEntregasAgr();
});

async function carregarEntregasAgr() {
    const filtro = document.getElementById('filtro-agricultor').value;
    ENTREGAS_AGR = await apiGet('/api/entregas-agricultor' + (filtro ? '?agricultorId=' + filtro : ''));

    const tb = document.getElementById('tb-entregas-agr');
    if (!ENTREGAS_AGR.length) {
        tb.innerHTML = '<tr><td colspan="7" class="vazio">Nenhum recebimento registrado.</td></tr>';
        return;
    }
    tb.innerHTML = ENTREGAS_AGR.map(e => {
        const kg = e.itens.reduce((s, i) => s + i.quantidadeKg, 0);
        const valor = e.itens.reduce((s, i) => s + i.quantidadeKg * i.precoPraticado, 0);
        return `
        <tr>
            <td>${fmtData(e.dataEntrega)}</td>
            <td><strong>${escapar(e.agricultor.nome)}</strong></td>
            <td>${e.itens.length}</td>
            <td class="num">${fmtKg(kg)}</td>
            <td class="num"><strong>${fmtBRL(valor)}</strong></td>
            <td>${escapar(e.registradoPor ? e.registradoPor.nome : '') || '—'}</td>
            <td class="acoes">
                <button class="btn-icone" title="Comprovante" onclick="comprovanteEntregaAgr(${e.id})">🖨️</button>
                <button class="btn-icone" title="Excluir" onclick="excluirEntregaAgr(${e.id})">🗑️</button>
            </td>
        </tr>`;
    }).join('');
}

function abrirFormEntregaAgr() {
    if (!AGRICULTORES.length) { toast('Cadastre um agricultor antes.', 'erro'); return; }
    if (!PRODUTOS.length) { toast('Cadastre produtos antes.', 'erro'); return; }

    abrirModal('Registrar recebimento', `
        <div class="linha-2">
            <div class="campo"><label>Agricultor *</label>
                <select id="f-agricultor" required onchange="filtrarProdutosDoAgricultor()">
                    <option value="">Selecione...</option>
                    ${AGRICULTORES.map(a => `<option value="${a.id}">${escapar(a.nome)}</option>`).join('')}
                </select></div>
            <div class="campo"><label>Data do recebimento *</label>
                <input type="date" id="f-data" value="${hojeISO()}" max="${hojeISO()}" required></div>
        </div>
        <div id="aviso-dap"></div>
        <div class="campo">
            <label>Itens recebidos *</label>
            <div id="itens-container">${linhaItemHtml()}</div>
            <button type="button" class="btn-secundario btn-pequeno" style="margin-top:6px"
                onclick="adicionarLinhaItem(produtosDoAgricultorSelecionado())">+ Adicionar item</button>
            <div class="ajuda">O preço vigente de cada produto é aplicado automaticamente.</div>
        </div>
    `, async () => {
        const dados = {
            agricultor: { id: parseInt(document.getElementById('f-agricultor').value, 10) },
            dataEntrega: document.getElementById('f-data').value,
            itens: coletarItens()
        };
        const criada = await apiPost('/api/entregas-agricultor', dados);
        fecharModal();
        toast('Recebimento registrado.', 'sucesso');
        await carregarEntregasAgr();
        setTimeout(() => comprovanteEntregaAgr(criada.id), 250);
    }, { largo: true });
}

/** Restringe o seletor de itens aos produtos vinculados ao agricultor. */
function produtosDoAgricultorSelecionado() {
    const id = parseInt(document.getElementById('f-agricultor').value, 10);
    const agricultor = AGRICULTORES.find(a => a.id === id);
    if (!agricultor || !agricultor.produtosFornecidos || !agricultor.produtosFornecidos.length) {
        return PRODUTOS;
    }
    const ids = agricultor.produtosFornecidos.map(p => p.id);
    const filtrados = PRODUTOS.filter(p => ids.includes(p.id));
    return filtrados.length ? filtrados : PRODUTOS;
}

function filtrarProdutosDoAgricultor() {
    const id = parseInt(document.getElementById('f-agricultor').value, 10);
    const agricultor = AGRICULTORES.find(a => a.id === id);

    const aviso = document.getElementById('aviso-dap');
    if (agricultor && agricultor.validadeDap &&
        new Date(agricultor.validadeDap + 'T00:00:00') < new Date()) {
        aviso.innerHTML = '<div class="aviso">⚠️ A DAP deste agricultor venceu em ' +
            fmtData(agricultor.validadeDap) + '. Verifique a documentação antes de prosseguir.</div>';
    } else {
        aviso.innerHTML = '';
    }

    // Recria a lista de itens com os produtos do agricultor
    document.getElementById('itens-container').innerHTML =
        linhaItemHtml(produtosDoAgricultorSelecionado());
}

async function excluirEntregaAgr(id) {
    if (!confirm('Excluir este recebimento?\n\nA ação não pode ser desfeita.')) return;
    try {
        await apiDelete('/api/entregas-agricultor/' + id);
        toast('Recebimento excluído.', 'sucesso');
        await carregarEntregasAgr();
    } catch (e) { toast(e.message, 'erro'); }
}

// ===== RF06: comprovante de recebimento (com valores) =====
function comprovanteEntregaAgr(id) {
    const e = ENTREGAS_AGR.find(x => x.id === id);
    if (!e) return;

    const linhas = e.itens.map(i => `
        <tr>
            <td>${escapar(i.produto ? i.produto.nome : 'Produto removido')}</td>
            <td class="num">${fmtNum(i.quantidadeKg)}</td>
            <td class="num">${fmtBRL(i.precoPraticado)}</td>
            <td class="num">${fmtBRL(i.quantidadeKg * i.precoPraticado)}</td>
        </tr>`).join('');

    const totalKg = e.itens.reduce((s, i) => s + i.quantidadeKg, 0);
    const total = e.itens.reduce((s, i) => s + i.quantidadeKg * i.precoPraticado, 0);

    abrirDocumento('Comprovante de recebimento', `
        <div class="documento">
            <h2>COMPROVANTE DE RECEBIMENTO DE PRODUTOS</h2>
            <div class="org">Integra PMAA – Programa Municipal de Aquisição de Alimentos<br>${ORGAO}</div>
            <div class="info">
                <strong>Comprovante nº:</strong> ${String(e.id).padStart(6, '0')}<br>
                <strong>Agricultor(a):</strong> ${escapar(e.agricultor.nome)}<br>
                <strong>CPF:</strong> ${escapar(e.agricultor.cpf)} &nbsp;|&nbsp;
                <strong>DAP:</strong> ${escapar(e.agricultor.numeroDap)}<br>
                <strong>Data do recebimento:</strong> ${fmtData(e.dataEntrega)}<br>
                <strong>Recebido por:</strong> ${escapar(e.registradoPor ? e.registradoPor.nome : '—')}
            </div>
            <table>
                <thead><tr>
                    <th>Produto</th><th class="num">Qtd. (kg)</th>
                    <th class="num">Preço/kg</th><th class="num">Subtotal</th>
                </tr></thead>
                <tbody>${linhas}</tbody>
                <tfoot><tr>
                    <td>Total</td><td class="num">${fmtNum(totalKg)}</td>
                    <td class="num">—</td><td class="num">${fmtBRL(total)}</td>
                </tr></tfoot>
            </table>
            <div class="assinatura"><div class="linha">Assinatura do agricultor(a)</div></div>
            <div class="assinatura"><div class="linha">Assinatura do responsável pelo recebimento</div></div>
            ${rodapeDocumento()}
        </div>
    `, 'doc-comprovante-agr');
}
