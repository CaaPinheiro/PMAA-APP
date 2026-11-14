function usuarioAtual() {
    try { return JSON.parse(localStorage.getItem('integrapmaa_usuario') || 'null'); }
    catch (e) { return null; }
}

function ehAdministrador() {
    const u = usuarioAtual();
    return !!u && u.papel === 'ADMINISTRADOR';
}

async function fazerLogin(evento) {
    evento.preventDefault();
    const botao = document.getElementById('btn-login');
    const erro = document.getElementById('login-erro');
    erro.style.display = 'none';
    botao.disabled = true;
    botao.textContent = 'Entrando...';

    try {
        const resposta = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                login: document.getElementById('input-login').value.trim(),
                senha: document.getElementById('input-senha').value
            })
        });
        const dados = await resposta.json().catch(() => null);

        if (!resposta.ok) {
            erro.textContent = (dados && dados.mensagem) || 'Falha ao entrar';
            erro.style.display = 'block';
            return;
        }

        localStorage.setItem('integrapmaa_token', dados.token);
        localStorage.setItem('integrapmaa_usuario', JSON.stringify({
            id: dados.id, nome: dados.nome, cargo: dados.cargo, papel: dados.papel
        }));
        mostrarApp();
    } catch (e) {
        erro.textContent = 'Nao foi possivel falar com o servidor.';
        erro.style.display = 'block';
    } finally {
        botao.disabled = false;
        botao.textContent = 'Entrar';
    }
}

function sair(mensagem) {
    localStorage.removeItem('integrapmaa_token');
    localStorage.removeItem('integrapmaa_usuario');
    if (mensagem) sessionStorage.setItem('integrapmaa_aviso', mensagem);
    location.reload();
}

function mostrarApp() {
    const usuario = usuarioAtual();
    if (!usuario) return;

    document.getElementById('tela-login').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('sidebar-usuario').innerHTML =
        '👤 <strong>' + escapar(usuario.nome) + '</strong><br>' +
        '<small>' + (usuario.papel === 'ADMINISTRADOR' ? 'Administrador' : 'Funcionário') + '</small>';

    document.getElementById('nav-admin').style.display = ehAdministrador() ? 'block' : 'none';
    navegar('dashboard');
}

function abrirTrocaSenha() {
    abrirModal('Trocar minha senha', `
        <div class="campo"><label>Senha atual *</label>
            <input type="password" id="ts-atual" required autocomplete="current-password"></div>
        <div class="campo"><label>Nova senha * <span class="ajuda">(mínimo 6 caracteres)</span></label>
            <input type="password" id="ts-nova" minlength="6" required autocomplete="new-password"></div>
        <div class="campo"><label>Confirme a nova senha *</label>
            <input type="password" id="ts-confirma" minlength="6" required autocomplete="new-password"></div>
    `, async () => {
        const nova = document.getElementById('ts-nova').value;
        if (nova !== document.getElementById('ts-confirma').value) {
            throw new Error('A confirmação não confere com a nova senha.');
        }
        await apiPost('/api/auth/trocar-senha', {
            senhaAtual: document.getElementById('ts-atual').value,
            novaSenha: nova
        });
        fecharModal();
        toast('Senha alterada com sucesso.', 'sucesso');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const aviso = sessionStorage.getItem('integrapmaa_aviso');
    if (aviso) {
        sessionStorage.removeItem('integrapmaa_aviso');
        const div = document.getElementById('login-erro');
        div.textContent = aviso;
        div.style.display = 'block';
    }
    if (localStorage.getItem('integrapmaa_token')) mostrarApp();
});
