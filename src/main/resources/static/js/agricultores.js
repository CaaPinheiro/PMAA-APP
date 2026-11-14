// RF01 - Cadastro de agricultores
registrarPagina('agricultores', async function () {
    conteudo(`
        <div class="page-header">
            <div><h2>👨‍🌾 Agricultores</h2>
            <div class="sub">Produtores familiares fornecedores do programa</div></div>
            <button class="btn-primary" onclick="abrirFormAgricultor()">+ Novo agricultor</button>
        </div>
        <div class="card"><div class="tabela-wrap">
            <table class="tabela">
                <thead><tr>
                    <th>Nome</th><th>CPF</th><th>DAP</th><th>Validade</th>
                    <th>Telefone</th><th>Localidade</th><th>Produtos</th><th></th>
                </tr></thead>
                <tbody id="tb-agricultores"><tr><td colspan="8" class="vazio">Carregando...</td></tr></tbody>
            </table>
        </div></div>`);

    PRODUTOS = await apiGet('/api/produtos');
    await carregarAgricultores();
});

async function carregarAgricultores() {
    AGRICULTORES = await apiGet('/api/agricultores');
    const tb = document.getElementById('tb-agricultores');
    if (!tb) return;

    if (!AGRICULTORES.length) {
        tb.innerHTML = '<tr><td colspan="8" class="vazio">Nenhum agricultor cadastrado.</td></tr>';
        return;
    }
    tb.innerHTML = AGRICULTORES.map(a => {
        const vencida = a.validadeDap && new Date(a.validadeDap + 'T00:00:00') < new Date();
        const produtos = (a.produtosFornecidos || []).map(p => p.nome);
        return `
        <tr>
            <td><strong>${escapar(a.nome)}</strong></td>
            <td>${escapar(a.cpf)}</td>
            <td>${escapar(a.numeroDap)}</td>
            <td>${fmtData(a.validadeDap)}
                ${vencida ? ' <span class="badge badge-vermelho">Vencida</span>' : ''}</td>
            <td>${escapar(a.telefone) || '—'}</td>
            <td>${escapar((a.endereco && a.endereco.localidadeRegiao) || '') || '—'}</td>
            <td title="${escapar(produtos.join(', '))}">
                ${produtos.length ? produtos.length + ' produto(s)' : '—'}</td>
            <td class="acoes">
                <button class="btn-icone" title="Editar" onclick="abrirFormAgricultor(${a.id})">✏️</button>
                <button class="btn-icone" title="Excluir" onclick="excluirAgricultor(${a.id})">🗑️</button>
            </td>
        </tr>`;
    }).join('');
}

function abrirFormAgricultor(id) {
    const a = id ? AGRICULTORES.find(x => x.id === id) : null;

    const listaProdutos = PRODUTOS.length
        ? PRODUTOS.map(p => `<label><input type="checkbox" name="produto-fornecido" value="${p.id}"> ${escapar(p.nome)}</label>`).join('')
        : '<small style="color:var(--texto-suave)">Nenhum produto no catálogo. ' +
          'Cadastre produtos primeiro para poder vinculá-los.</small>';

    abrirModal(a ? 'Editar agricultor' : 'Novo agricultor', `
        <div class="campo"><label>Nome completo *</label>
            <input type="text" id="f-nome" required maxlength="150"></div>
        <div class="linha-2">
            <div class="campo"><label>CPF *</label>
                <input type="text" id="f-cpf" placeholder="000.000.000-00" required maxlength="14"
                    ${a ? 'disabled title="O CPF não pode ser alterado"' : ''}></div>
            <div class="campo"><label>Telefone</label>
                <input type="text" id="f-telefone" placeholder="(91) 90000-0000" maxlength="20"></div>
        </div>
        <div class="campo"><label>E-mail</label>
            <input type="email" id="f-email" maxlength="120"></div>
        <div class="linha-2">
            <div class="campo"><label>Nº da DAP *</label>
                <input type="text" id="f-dap" required maxlength="40"></div>
            <div class="campo"><label>Validade da DAP *</label>
                <input type="date" id="f-validade" required></div>
        </div>
        <div class="linha-3">
            <div class="campo"><label>Localidade / comunidade</label>
                <input type="text" id="f-localidade" placeholder="Ex.: Vila do Conde"></div>
            <div class="campo"><label>Cidade</label>
                <input type="text" id="f-cidade" value="Barcarena"></div>
            <div class="campo"><label>UF</label>
                <input type="text" id="f-uf" value="PA" maxlength="2"></div>
        </div>
        <div class="campo"><label>Produtos fornecidos</label>
            <div class="check-lista"><div class="check-grid">${listaProdutos}</div></div>
            <div class="ajuda">Usado para agilizar o registro de recebimentos deste agricultor.</div></div>
        <div class="campo"><label>Observações</label>
            <textarea id="f-obs" rows="2" maxlength="500"></textarea></div>
    `, async () => {
        const dados = {
            nome: document.getElementById('f-nome').value.trim(),
            cpf: a ? a.cpf : document.getElementById('f-cpf').value.trim(),
            telefone: document.getElementById('f-telefone').value.trim(),
            email: document.getElementById('f-email').value.trim(),
            numeroDap: document.getElementById('f-dap').value.trim(),
            validadeDap: document.getElementById('f-validade').value,
            observacoes: document.getElementById('f-obs').value.trim(),
            endereco: {
                localidadeRegiao: document.getElementById('f-localidade').value.trim(),
                cidade: document.getElementById('f-cidade').value.trim(),
                uf: document.getElementById('f-uf').value.trim().toUpperCase()
            },
            produtosFornecidos: [...document.querySelectorAll('input[name=produto-fornecido]:checked')]
                .map(c => ({ id: parseInt(c.value, 10) }))
        };

        if (a) await apiPut('/api/agricultores/' + a.id, dados);
        else await apiPost('/api/agricultores', dados);

        fecharModal();
        toast(a ? 'Agricultor atualizado.' : 'Agricultor cadastrado.', 'sucesso');
        await carregarAgricultores();
    }, { largo: true });

    if (a) {
        document.getElementById('f-nome').value = a.nome;
        document.getElementById('f-cpf').value = a.cpf;
        document.getElementById('f-telefone').value = a.telefone || '';
        document.getElementById('f-email').value = a.email || '';
        document.getElementById('f-dap').value = a.numeroDap;
        document.getElementById('f-validade').value = a.validadeDap || '';
        document.getElementById('f-obs').value = a.observacoes || '';
        if (a.endereco) {
            document.getElementById('f-localidade').value = a.endereco.localidadeRegiao || '';
            document.getElementById('f-cidade').value = a.endereco.cidade || 'Barcarena';
            document.getElementById('f-uf').value = a.endereco.uf || 'PA';
        }
        (a.produtosFornecidos || []).forEach(p => {
            const c = document.querySelector('input[name=produto-fornecido][value="' + p.id + '"]');
            if (c) c.checked = true;
        });
    }
}

async function excluirAgricultor(id) {
    const a = AGRICULTORES.find(x => x.id === id);
    if (!confirm('Excluir o agricultor "' + a.nome + '"?\n\n' +
                 'O histórico de entregas e pagamentos é preservado.')) return;
    try {
        await apiDelete('/api/agricultores/' + id);
        toast('Agricultor excluído.', 'sucesso');
        await carregarAgricultores();
    } catch (e) { toast(e.message, 'erro'); }
}
