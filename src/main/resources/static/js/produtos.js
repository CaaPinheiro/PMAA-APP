let PRODUTOS = [];

async function paginaProdutos() {
    conteudo(`
        <div class="page-header">
            <h2>🥦 Produtos</h2>
            <button class="btn-primary" onclick="abrirFormProduto()">+ Novo Produto</button>
        </div>
        <div class="card">
            <table class="tabela">
                <thead><tr><th>Produto</th><th>Preço por Kg</th><th></th></tr></thead>
                <tbody id="tb-produtos"><tr><td colspan="3" class="vazio">Carregando...</td></tr></tbody>
            </table>
        </div>`);
    await carregarProdutos();
}

async function carregarProdutos() {
    PRODUTOS = await apiGet('/api/produtos');
    const tb = document.getElementById('tb-produtos');
    if (!PRODUTOS.length) {
        tb.innerHTML = '<tr><td colspan="3" class="vazio">Nenhum produto cadastrado</td></tr>';
        return;
    }
    tb.innerHTML = PRODUTOS.map(p => `
        <tr>
            <td><strong>${p.nome}</strong></td>
            <td>${fmtBRL(p.precoKg)}</td>
            <td class="acoes">
                <button class="btn-icone" title="Editar" onclick="abrirFormProduto(${p.id})">✏️</button>
                <button class="btn-icone" title="Excluir" onclick="excluirProduto(${p.id})">🗑️</button>
            </td>
        </tr>`).join('');
}

function abrirFormProduto(id) {
    const p = id ? PRODUTOS.find(x => x.id === id) : null;
    abrirModal(p ? 'Editar Produto' : 'Novo Produto', `
        <div class="campo"><label>Nome do produto *</label>
            <input type="text" id="f-nome" placeholder="Ex: Farinha de mandioca" required></div>
        <div class="campo"><label>Preço por Kg (R$) *</label>
            <input type="number" id="f-preco" step="0.01" min="0.01" placeholder="0,00" required></div>
    `, async () => {
        const payload = {
            nome: document.getElementById('f-nome').value.trim(),
            precoKg: parseFloat(document.getElementById('f-preco').value)
        };
        if (p) await apiPut('/api/produtos/' + p.id, payload);
        else await apiPost('/api/produtos', payload);
        fecharModal();
        await carregarProdutos();
    });

    if (p) {
        document.getElementById('f-nome').value = p.nome;
        document.getElementById('f-preco').value = p.precoKg;
    }
}

async function excluirProduto(id) {
    const p = PRODUTOS.find(x => x.id === id);
    if (!confirm('Excluir o produto "' + p.nome + '"?')) return;
    await apiDelete('/api/produtos/' + id);
    await carregarProdutos();
}
