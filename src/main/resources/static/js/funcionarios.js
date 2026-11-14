// RF07 - Controle administrativo: conceder, editar e remover acesso
let FUNCIONARIOS = [];

registrarPagina('funcionarios', async function () {
    conteudo(`
        <div class="page-header">
            <div><h2>👥 Funcionários</h2>
            <div class="sub">Concessão, alteração e remoção de acesso ao sistema</div></div>
            <button class="btn-primary" onclick="abrirFormFuncionario()">+ Conceder acesso</button>
        </div>
        <div class="card"><div class="tabela-wrap">
            <table class="tabela">
                <thead><tr>
                    <th>Nome</th><th>Cargo</th><th>Login</th>
                    <th>Nível de acesso</th><th>Situação</th><th></th>
                </tr></thead>
                <tbody id="tb-funcionarios"><tr><td colspan="6" class="vazio">Carregando...</td></tr></tbody>
            </table>
        </div></div>`);
    await carregarFuncionarios();
});

async function carregarFuncionarios() {
    FUNCIONARIOS = await apiGet('/api/funcionarios');
    const tb = document.getElementById('tb-funcionarios');
    if (!tb) return;

    const eu = usuarioAtual();
    tb.innerHTML = FUNCIONARIOS.map(f => {
        const souEu = eu && f.id === eu.id;
        return `
        <tr>
            <td><strong>${escapar(f.nome)}</strong>${souEu ? ' <span class="badge badge-azul">você</span>' : ''}</td>
            <td>${escapar(f.cargo) || '—'}</td>
            <td>${escapar(f.login)}</td>
            <td>${f.papel === 'ADMINISTRADOR'
                ? '<span class="badge badge-ambar">Administrador</span>'
                : '<span class="badge badge-cinza">Funcionário</span>'}</td>
            <td>${f.ativo
                ? '<span class="badge badge-verde">Ativo</span>'
                : '<span class="badge badge-cinza">Inativo</span>'}</td>
            <td class="acoes">
                <button class="btn-icone" title="Editar dados e nível de acesso"
                    onclick="abrirFormFuncionario(${f.id})">✏️</button>
                <button class="btn-icone" title="Redefinir senha"
                    onclick="redefinirSenhaFuncionario(${f.id})">🔑</button>
                <button class="btn-icone" title="${f.ativo ? 'Remover acesso' : 'Restaurar acesso'}"
                    onclick="alternarFuncionario(${f.id})">${f.ativo ? '🔒' : '🔓'}</button>
            </td>
        </tr>`;
    }).join('');
}

function abrirFormFuncionario(id) {
    const f = id ? FUNCIONARIOS.find(x => x.id === id) : null;
    const eu = usuarioAtual();
    const souEu = f && eu && f.id === eu.id;

    const camposNovo = `
        <div class="linha-2">
            <div class="campo"><label>Login *</label>
                <input type="text" id="f-login" required autocomplete="off" maxlength="40"></div>
            <div class="campo"><label>Senha * <span class="ajuda">(mín. 6)</span></label>
                <input type="password" id="f-senha" minlength="6" required autocomplete="new-password"></div>
        </div>`;

    abrirModal(f ? 'Editar funcionário' : 'Conceder acesso', `
        <div class="campo"><label>Nome completo *</label>
            <input type="text" id="f-nome" required maxlength="150"></div>
        <div class="campo"><label>Cargo *</label>
            <input type="text" id="f-cargo" placeholder="Ex.: Assistente administrativo" required maxlength="80"></div>
        ${f ? '' : camposNovo}
        <div class="campo"><label>Nível de acesso *</label>
            <select id="f-papel" ${souEu ? 'disabled' : ''}>
                <option value="FUNCIONARIO">Funcionário — cadastros, entregas e relatórios</option>
                <option value="ADMINISTRADOR">Administrador — inclui pagamentos e gestão de acessos</option>
            </select>
            <div class="ajuda">${souEu
                ? 'Você não pode alterar o próprio nível de acesso.'
                : 'Administradores autorizam pagamentos e gerenciam os acessos dos demais.'}</div></div>
    `, async () => {
        const nome = document.getElementById('f-nome').value.trim();
        const cargo = document.getElementById('f-cargo').value.trim();
        const papel = document.getElementById('f-papel').value;

        if (f) {
            await apiPut('/api/funcionarios/' + f.id, { nome, cargo, papel: souEu ? f.papel : papel });
            toast('Funcionário atualizado.', 'sucesso');
        } else {
            await apiPost('/api/funcionarios', {
                nome, cargo,
                login: document.getElementById('f-login').value.trim(),
                senha: document.getElementById('f-senha').value,
                papel
            });
            toast('Acesso concedido.', 'sucesso');
        }
        fecharModal();
        await carregarFuncionarios();
    });

    if (f) {
        document.getElementById('f-nome').value = f.nome;
        document.getElementById('f-cargo').value = f.cargo || '';
        document.getElementById('f-papel').value = f.papel;
    }
}

async function redefinirSenhaFuncionario(id) {
    const f = FUNCIONARIOS.find(x => x.id === id);
    abrirModal('Redefinir senha de ' + escapar(f.nome), `
        <div class="campo"><label>Nova senha * <span class="ajuda">(mínimo 6 caracteres)</span></label>
            <input type="password" id="rs-senha" minlength="6" required autocomplete="new-password"></div>
        <div class="campo"><label>Confirme a nova senha *</label>
            <input type="password" id="rs-confirma" minlength="6" required autocomplete="new-password"></div>
        <div class="aviso">Informe a nova senha ao funcionário e oriente-o a trocá-la no primeiro acesso.</div>
    `, async () => {
        const senha = document.getElementById('rs-senha').value;
        if (senha !== document.getElementById('rs-confirma').value) {
            throw new Error('A confirmação não confere com a nova senha.');
        }
        await apiPut('/api/funcionarios/' + id + '/senha', { senha });
        fecharModal();
        toast('Senha redefinida.', 'sucesso');
    });
}

async function alternarFuncionario(id) {
    const f = FUNCIONARIOS.find(x => x.id === id);
    const acao = f.ativo ? 'Remover o acesso de' : 'Restaurar o acesso de';
    if (!confirm(acao + ' "' + f.nome + '"?')) return;
    try {
        await apiPut('/api/funcionarios/' + id + '/alternar-ativo');
        toast(f.ativo ? 'Acesso removido.' : 'Acesso restaurado.', 'sucesso');
        await carregarFuncionarios();
    } catch (e) { toast(e.message, 'erro'); }
}
