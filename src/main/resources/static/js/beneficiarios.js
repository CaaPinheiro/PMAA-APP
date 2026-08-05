let BENEFICIARIOS = [];

async function paginaBeneficiarios() {
    conteudo(`
        <div class="page-header">
            <h2>🏛️ Entidades Beneficiárias</h2>
            <button class="btn-primary" onclick="abrirFormBeneficiario()">+ Nova Entidade</button>
        </div>
        <div class="card">
            <table class="tabela">
                <thead><tr>
                    <th>Entidade</th><th>Responsável</th><th>Telefone</th><th>Público</th><th>Refeições</th><th></th>
                </tr></thead>
                <tbody id="tb-beneficiarios"><tr><td colspan="6" class="vazio">Carregando...</td></tr></tbody>
            </table>
        </div>`);
    await carregarBeneficiarios();
}

async function carregarBeneficiarios() {
    BENEFICIARIOS = await apiGet('/api/beneficiarios');
    const tb = document.getElementById('tb-beneficiarios');
    if (!BENEFICIARIOS.length) {
        tb.innerHTML = '<tr><td colspan="6" class="vazio">Nenhuma entidade cadastrada</td></tr>';
        return;
    }
    tb.innerHTML = BENEFICIARIOS.map(b => `
        <tr>
            <td><strong>${b.nome}</strong></td>
            <td>${b.responsavel}</td>
            <td>${b.telefone || '-'}</td>
            <td>${(b.publicoAtendido || []).length} faixa(s)</td>
            <td>${(b.refeicoesOfertadas || []).length} tipo(s)</td>
            <td class="acoes">
                <button class="btn-icone" title="Editar" onclick="abrirFormBeneficiario(${b.id})">✏️</button>
                <button class="btn-icone" title="Excluir" onclick="excluirBeneficiario(${b.id})">🗑️</button>
            </td>
        </tr>`).join('');
}

function abrirFormBeneficiario(id) {
    const b = id ? BENEFICIARIOS.find(x => x.id === id) : null;

    const faixasHtml = Object.entries(FAIXAS).map(([k, v]) =>
        `<label><input type="checkbox" name="faixa" value="${k}"> ${v}</label>`).join('');
    const refeicoesHtml = Object.entries(REFEICOES).map(([k, v]) =>
        `<label><input type="checkbox" name="refeicao" value="${k}"> ${v}</label>`).join('');

    abrirModal(b ? 'Editar Entidade' : 'Nova Entidade Beneficiária', `
        <div class="campo"><label>Nome da entidade *</label>
            <input type="text" id="f-nome" placeholder="Ex: Casa de Apoio São Francisco" required></div>
        <div class="linha-2">
            <div class="campo"><label>Responsável *</label>
                <input type="text" id="f-responsavel" required></div>
            <div class="campo"><label>Telefone</label>
                <input type="text" id="f-telefone"></div>
        </div>
        <div class="campo"><label>E-mail</label>
            <input type="email" id="f-email"></div>
        <div class="linha-3">
            <div class="campo"><label>Localidade / Bairro</label>
                <input type="text" id="f-localidade"></div>
            <div class="campo"><label>Cidade</label>
                <input type="text" id="f-cidade" value="Barcarena"></div>
            <div class="campo"><label>UF</label>
                <input type="text" id="f-uf" value="PA" maxlength="2"></div>
        </div>
        <div class="campo"><label>Público atendido (faixas etárias)</label>
            <div class="check-grid">${faixasHtml}</div></div>
        <div class="campo"><label>Refeições ofertadas</label>
            <div class="check-grid">${refeicoesHtml}</div></div>
    `, async () => {
        const payload = {
            nome: document.getElementById('f-nome').value.trim(),
            responsavel: document.getElementById('f-responsavel').value.trim(),
            telefone: document.getElementById('f-telefone').value.trim(),
            email: document.getElementById('f-email').value.trim(),
            endereco: {
                localidadeRegiao: document.getElementById('f-localidade').value.trim(),
                cidade: document.getElementById('f-cidade').value.trim(),
                uf: document.getElementById('f-uf').value.trim().toUpperCase()
            },
            publicoAtendido: [...document.querySelectorAll('input[name=faixa]:checked')].map(c => c.value),
            refeicoesOfertadas: [...document.querySelectorAll('input[name=refeicao]:checked')].map(c => c.value)
        };
        if (b) await apiPut('/api/beneficiarios/' + b.id, payload);
        else await apiPost('/api/beneficiarios', payload);
        fecharModal();
        await carregarBeneficiarios();
    });

    if (b) {
        document.getElementById('f-nome').value = b.nome;
        document.getElementById('f-responsavel').value = b.responsavel;
        document.getElementById('f-telefone').value = b.telefone || '';
        document.getElementById('f-email').value = b.email || '';
        if (b.endereco) {
            document.getElementById('f-localidade').value = b.endereco.localidadeRegiao || '';
            document.getElementById('f-cidade').value = b.endereco.cidade || 'Barcarena';
            document.getElementById('f-uf').value = b.endereco.uf || 'PA';
        }
        (b.publicoAtendido || []).forEach(v => {
            const c = document.querySelector('input[name=faixa][value="' + v + '"]');
            if (c) c.checked = true;
        });
        (b.refeicoesOfertadas || []).forEach(v => {
            const c = document.querySelector('input[name=refeicao][value="' + v + '"]');
            if (c) c.checked = true;
        });
    }
}

async function excluirBeneficiario(id) {
    const b = BENEFICIARIOS.find(x => x.id === id);
    if (!confirm('Excluir a entidade "' + b.nome + '"?')) return;
    await apiDelete('/api/beneficiarios/' + id);
    await carregarBeneficiarios();
}
