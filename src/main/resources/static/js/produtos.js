// RF03 - Cadastro de produtos
registrarPagina('produtos', async function () {
    conteudo(`
        <div class="page-header">
            <div><h2>🥦 Produtos</h2>
            <div class="sub">Catálogo com o preço por quilo praticado pelo programa</div></div>
            <button class="btn-primary" onclick="abrirFormProduto()">+ Novo produto</button>
        </div>
        <div class="card"><div class="tabela-wrap">
            <table class="tabela">
                <thead><tr><th>Produto</th><th class="num">Preço por kg</th><th></th></tr></thead>
                <tbody id="tb-produtos"><tr><td colspan="3" class="vazio">Carregando...</td></tr></tbody>
            </table>
        </div></div>`);
    await carregarProdutos();
});

async function carregarProdutos() {
    PRODUTOS = await apiGet('/api/produtos');
    const tb = document.getElementById('tb-produtos');
    if (!tb) return;

    if (!PRODUTOS.length) {
        tb.innerHTML = '<tr><td colspan="3" class="vazio">Nenhum produto cadastrado. ' +
                       'Comece por aqui: os recebimentos dependem do catálogo.</td></tr>';
        return;
    }
    tb.innerHTML = PRODUTOS.map(p => `
        <tr>
            <td><strong>${escapar(p.nome)}</strong></td>
            <td class="num">${fmtBRL(p.precoKg)}</td>
            <td class="acoes">
                <button class="btn-icone" title="Editar" onclick="abrirFormProduto(${p.id})">✏️</button>
                <button class="btn-icone" title="Excluir" onclick="excluirProduto(${p.id})">🗑️</button>
            </td>
        </tr>`).join('');
}

function abrirFormProduto(id) {
    const p = id ? PRODUTOS.find(x => x.id === id) : null;

    abrirModal(p ? 'Editar produto' : 'Novo produto', `
        <div class="campo"><label>Nome do produto *</label>
            <input type="text" id="f-nome" placeholder="Ex.: Farinha de mandioca" required maxlength="120"></div>
        <div class="campo"><label>Preço por kg (R$) *</label>
            <input type="number" id="f-preco" step="0.01" min="0.01" placeholder="0,00" required>
            <div class="ajuda">O preço vigente é congelado no momento de cada recebimento —
                reajustes não alteram valores já apurados.</div></div>
    `, async () => {
        const dados = {
            nome: document.getElementById('f-nome').value.trim(),
            precoKg: parseFloat(document.getElementById('f-preco').value)
        };
        if (p) await apiPut('/api/produtos/' + p.id, dados);
        else await apiPost('/api/produtos', dados);
        fecharModal();
        toast(p ? 'Produto atualizado.' : 'Produto cadastrado.', 'sucesso');
        await carregarProdutos();
    });

    if (p) {
        document.getElementById('f-nome').value = p.nome;
        document.getElementById('f-preco').value = p.precoKg;
    }
}

async function excluirProduto(id) {
    const p = PRODUTOS.find(x => x.id === id);
    if (!confirm('Excluir o produto "' + p.nome + '"?\n\n' +
                 'Ele sai do catálogo, mas continua visível nas entregas já registradas.')) return;
    try {
        await apiDelete('/api/produtos/' + id);
        toast('Produto excluído.', 'sucesso');
        await carregarProdutos();
    } catch (e) { toast(e.message, 'erro'); }
}
