// RF02 - Cadastro de beneficiários
registrarPagina('beneficiarios', async function () {
    conteudo(`
        <div class="page-header">
            <div><h2>🏛️ Entidades beneficiárias</h2>
            <div class="sub">Instituições que recebem as cestas do programa</div></div>
            <button class="btn-primary" onclick="abrirFormBeneficiario()">+ Nova entidade</button>
        </div>
        <div class="card"><div class="tabela-wrap">
            <table class="tabela">
                <thead><tr>
                    <th>Entidade</th><th>Responsável</th><th>Telefone</th>
                    <th>Localidade</th><th>Público atendido</th><th>Refeições</th><th></th>
                </tr></thead>
                <tbody id="tb-beneficiarios"><tr><td colspan="7" class="vazio">Carregando...</td></tr></tbody>
            </table>
        </div></div>`);
    await carregarBeneficiarios();
});

async function carregarBeneficiarios() {
    BENEFICIARIOS = await apiGet('/api/beneficiarios');
    const tb = document.getElementById('tb-beneficiarios');
    if (!tb) return;

    if (!BENEFICIARIOS.length) {
        tb.innerHTML = '<tr><td colspan="7" class="vazio">Nenhuma entidade cadastrada.</td></tr>';
        return;
    }
    tb.innerHTML = BENEFICIARIOS.map(b => {
        const faixas = (b.publicoAtendido || []).map(f => FAIXAS[f] || f);
        const refeicoes = (b.refeicoesOfertadas || []).map(r => REFEICOES[r] || r);
        return `
        <tr>
            <td><strong>${escapar(b.nome)}</strong></td>
            <td>${escapar(b.responsavel)}</td>
            <td>${escapar(b.telefone) || '—'}</td>
            <td>${escapar((b.endereco && b.endereco.localidadeRegiao) || '') || '—'}</td>
            <td title="${escapar(faixas.join(', '))}">${faixas.length ? faixas.length + ' faixa(s)' : '—'}</td>
            <td title="${escapar(refeicoes.join(', '))}">${refeicoes.length ? refeicoes.length + ' tipo(s)' : '—'}</td>
            <td class="acoes">
                <button class="btn-icone" title="Editar" onclick="abrirFormBeneficiario(${b.id})">✏️</button>
                <button class="btn-icone" title="Excluir" onclick="excluirBeneficiario(${b.id})">🗑️</button>
            </td>
        </tr>`;
    }).join('');
}

function abrirFormBeneficiario(id) {
    const b = id ? BENEFICIARIOS.find(x => x.id === id) : null;

    const faixasHtml = Object.entries(FAIXAS).map(([k, v]) =>
        `<label><input type="checkbox" name="faixa" value="${k}"> ${v}</label>`).join('');
    const refeicoesHtml = Object.entries(REFEICOES).map(([k, v]) =>
        `<label><input type="checkbox" name="refeicao" value="${k}"> ${v}</label>`).join('');

    abrirModal(b ? 'Editar entidade' : 'Nova entidade beneficiária', `
        <div class="campo"><label>Nome da entidade *</label>
            <input type="text" id="f-nome" placeholder="Ex.: Casa de Apoio São Francisco" required maxlength="150"></div>
        <div class="linha-2">
            <div class="campo"><label>Responsável *</label>
                <input type="text" id="f-responsavel" required maxlength="150"></div>
            <div class="campo"><label>Telefone</label>
                <input type="text" id="f-telefone" maxlength="20"></div>
        </div>
        <div class="campo"><label>E-mail</label>
            <input type="email" id="f-email" maxlength="120"></div>
        <div class="linha-3">
            <div class="campo"><label>Localidade / bairro</label>
                <input type="text" id="f-localidade"></div>
            <div class="campo"><label>Cidade</label>
                <input type="text" id="f-cidade" value="Barcarena"></div>
            <div class="campo"><label>UF</label>
                <input type="text" id="f-uf" value="PA" maxlength="2"></div>
        </div>
        <div class="campo"><label>Público atendido</label>
            <div class="check-lista"><div class="check-grid">${faixasHtml}</div></div></div>
        <div class="campo"><label>Refeições ofertadas</label>
            <div class="check-lista"><div class="check-grid">${refeicoesHtml}</div></div></div>
    `, async () => {
        const dados = {
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

        if (b) await apiPut('/api/beneficiarios/' + b.id, dados);
        else await apiPost('/api/beneficiarios', dados);

        fecharModal();
        toast(b ? 'Entidade atualizada.' : 'Entidade cadastrada.', 'sucesso');
        await carregarBeneficiarios();
    }, { largo: true });

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
    if (!confirm('Excluir a entidade "' + b.nome + '"?\n\nO histórico de entregas é preservado.')) return;
    try {
        await apiDelete('/api/beneficiarios/' + id);
        toast('Entidade excluída.', 'sucesso');
        await carregarBeneficiarios();
    } catch (e) { toast(e.message, 'erro'); }
}
