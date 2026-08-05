let FUNCIONARIOS = [];

async function paginaFuncionarios() {
    conteudo(`
        <div class="page-header">
            <h2>👥 Funcionários</h2>
            <button class="btn-primary" onclick="abrirFormFuncionario()">+ Novo Funcionário</button>
        </div>
        <div class="card">
            <table class="tabela">
                <thead><tr>
                    <th>Nome</th><th>Cargo</th><th>Login</th><th>Papel</th><th>Status</th><th></th>
                </tr></thead>
                <tbody id="tb-funcionarios"><tr><td colspan="6" class="vazio">Carregando...</td></tr></tbody>
            </table>
        </div>`);
    await carregarFuncionarios();
}

async function carregarFuncionarios() {
    FUNCIONARIOS = await apiGet('/api/funcionarios');
    const tb = document.getElementById('tb-funcionarios');
    tb.innerHTML = FUNCIONARIOS.map(f => `
        <tr>
            <td><strong>${f.nome}</strong></td>
            <td>${f.cargo || '-'}</td>
            <td>${f.login}</td>
            <td>${f.papel === 'ADMINISTRADOR'
                ? '<span class="badge badge-amarelo">Administrador</span>'
                : '<span class="badge badge-cinza">Funcionário</span>'}</td>
            <td>${f.ativo
                ? '<span class="badge badge-verde">Ativo</span>'
                : '<span class="badge badge-cinza">Inativo</span>'}</td>
            <td class="acoes">
                <button class="btn-icone" title="${f.ativo ? 'Desativar' : 'Reativar'}"
                    onclick="alternarFuncionario(${f.id})">${f.ativo ? '🔒' : '🔓'}</button>
            </td>
        </tr>`).join('');
}

function abrirFormFuncionario() {
    abrirModal('Novo Funcionário', `
        <div class="campo"><label>Nome completo *</label>
            <input type="text" id="f-nome" required></div>
        <div class="campo"><label>Cargo *</label>
            <input type="text" id="f-cargo" placeholder="Ex: Assistente administrativo" required></div>
        <div class="linha-2">
            <div class="campo"><label>Login *</label>
                <input type="text" id="f-login" required autocomplete="off"></div>
            <div class="campo"><label>Senha * (mín. 6 caracteres)</label>
                <input type="password" id="f-senha" minlength="6" required autocomplete="new-password"></div>
        </div>
        <div class="campo">
            <label style="display:flex;align-items:center;gap:8px;font-weight:normal;cursor:pointer">
                <input type="checkbox" id="f-admin">
                Conceder permissões de <strong>Administrador</strong> (pagamentos e funcionários)
            </label>
        </div>
    `, async () => {
        await apiPost('/api/funcionarios', {
            nome: document.getElementById('f-nome').value.trim(),
            cargo: document.getElementById('f-cargo').value.trim(),
            login: document.getElementById('f-login').value.trim(),
            senha: document.getElementById('f-senha').value,
            admin: document.getElementById('f-admin').checked
        });
        fecharModal();
        await carregarFuncionarios();
    });
}

async function alternarFuncionario(id) {
    const f = FUNCIONARIOS.find(x => x.id === id);
    if (f.id === usuarioAtual().id) {
        alert('Você não pode desativar seu próprio usuário.');
        return;
    }
    if (!confirm((f.ativo ? 'Desativar' : 'Reativar') + ' o funcionário "' + f.nome + '"?')) return;
    await apiPut('/api/funcionarios/' + id + '/alternar-ativo');
    await carregarFuncionarios();
}
