let AGRICULTORES = [];

async function paginaAgricultores() {
    conteudo(`
        <div class="page-header">
            <h2>👨‍🌾 Agricultores</h2>
            <button class="btn-primary" onclick="abrirFormAgricultor()">+ Novo Agricultor</button>
        </div>
        <div class="card">
            <table class="tabela">
                <thead><tr>
                    <th>Nome</th><th>CPF</th><th>DAP</th><th>Validade DAP</th><th>Telefone</th><th>Localidade</th><th></th>
                </tr></thead>
                <tbody id="tb-agricultores"><tr><td colspan="7" class="vazio">Carregando...</td></tr></tbody>
            </table>
        </div>`);
    await carregarAgricultores();
}

async function carregarAgricultores() {
    AGRICULTORES = await apiGet('/api/agricultores');
    const tb = document.getElementById('tb-agricultores');
    if (!AGRICULTORES.length) {
        tb.innerHTML = '<tr><td colspan="7" class="vazio">Nenhum agricultor cadastrado</td></tr>';
        return;
    }
    tb.innerHTML = AGRICULTORES.map(a => `
        <tr>
            <td><strong>${a.nome}</strong></td>
            <td>${a.cpf}</td>
            <td>${a.numeroDap}</td>
            <td>${fmtData(a.validadeDap)}</td>
            <td>${a.telefone || '-'}</td>
            <td>${(a.endereco && a.endereco.localidadeRegiao) || '-'}</td>
            <td class="acoes">
                <button class="btn-icone" title="Editar" onclick="abrirFormAgricultor(${a.id})">✏️</button>
                <button class="btn-icone" title="Excluir" onclick="excluirAgricultor(${a.id})">🗑️</button>
            </td>
        </tr>`).join('');
}

function abrirFormAgricultor(id) {
    const a = id ? AGRICULTORES.find(x => x.id === id) : null;
    abrirModal(a ? 'Editar Agricultor' : 'Novo Agricultor', `
        <div class="campo"><label>Nome completo *</label>
            <input type="text" id="f-nome" required></div>
        <div class="linha-2">
            <div class="campo"><label>CPF *</label>
                <input type="text" id="f-cpf" placeholder="000.000.000-00" required ${a ? 'disabled' : ''}></div>
            <div class="campo"><label>Telefone</label>
                <input type="text" id="f-telefone" placeholder="(91) 90000-0000"></div>
        </div>
        <div class="campo"><label>E-mail</label>
            <input type="email" id="f-email"></div>
        <div class="linha-2">
            <div class="campo"><label>Nº da DAP *</label>
                <input type="text" id="f-dap" required></div>
            <div class="campo"><label>Validade da DAP *</label>
                <input type="date" id="f-validade" required></div>
        </div>
        <div class="linha-3">
            <div class="campo"><label>Localidade / Região</label>
                <input type="text" id="f-localidade" placeholder="Ex: Vila do Conde"></div>
            <div class="campo"><label>Cidade</label>
                <input type="text" id="f-cidade" value="Barcarena"></div>
            <div class="campo"><label>UF</label>
                <input type="text" id="f-uf" value="PA" maxlength="2"></div>
        </div>
        <div class="campo"><label>Observações</label>
            <textarea id="f-obs" rows="2"></textarea></div>
    `, async () => {
        const payload = {
            nome: document.getElementById('f-nome').value.trim(),
            cpf: document.getElementById('f-cpf').value.trim(),
            telefone: document.getElementById('f-telefone').value.trim(),
            email: document.getElementById('f-email').value.trim(),
            numeroDap: document.getElementById('f-dap').value.trim(),
            validadeDap: document.getElementById('f-validade').value,
            observacoes: document.getElementById('f-obs').value.trim(),
            endereco: {
                localidadeRegiao: document.getElementById('f-localidade').value.trim(),
                cidade: document.getElementById('f-cidade').value.trim(),
                uf: document.getElementById('f-uf').value.trim().toUpperCase()
            }
        };
        if (a) {
            payload.cpf = a.cpf;
            await apiPut('/api/agricultores/' + a.id, payload);
        } else {
            await apiPost('/api/agricultores', payload);
        }
        fecharModal();
        await carregarAgricultores();
    });

    if (a) {
        document.getElementById('f-nome').value = a.nome;
        document.getElementById('f-cpf').value = a.cpf;
        document.getElementById('f-telefone').value = a.telefone || '';
        document.getElementById('f-email').value = a.email || '';
        document.getElementById('f-dap').value = a.numeroDap;
        document.getElementById('f-validade').value = a.validadeDap;
        document.getElementById('f-obs').value = a.observacoes || '';
        if (a.endereco) {
            document.getElementById('f-localidade').value = a.endereco.localidadeRegiao || '';
            document.getElementById('f-cidade').value = a.endereco.cidade || 'Barcarena';
            document.getElementById('f-uf').value = a.endereco.uf || 'PA';
        }
    }
}

async function excluirAgricultor(id) {
    const a = AGRICULTORES.find(x => x.id === id);
    if (!confirm('Excluir o agricultor "' + a.nome + '"?\n\nO histórico de entregas será preservado.')) return;
    await apiDelete('/api/agricultores/' + id);
    await carregarAgricultores();
}
