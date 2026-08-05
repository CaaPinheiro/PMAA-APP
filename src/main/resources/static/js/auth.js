function usuarioAtual() {
    return JSON.parse(localStorage.getItem('pmaa_usuario') || 'null');
}

async function fazerLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-login');
    const erroDiv = document.getElementById('login-erro');
    erroDiv.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Entrando...';

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                login: document.getElementById('input-login').value.trim(),
                senha: document.getElementById('input-senha').value
            })
        });
        const data = await res.json();

        if (!res.ok) {
            erroDiv.textContent = data.mensagem || 'Falha no login';
            erroDiv.style.display = 'block';
            return;
        }

        localStorage.setItem('pmaa_token', data.token);
        localStorage.setItem('pmaa_usuario', JSON.stringify({
            id: data.id, nome: data.nome, papel: data.papel
        }));
        mostrarApp();
    } catch (err) {
        erroDiv.textContent = 'Erro de conexão com o servidor';
        erroDiv.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Entrar';
    }
}

function sair() {
    localStorage.removeItem('pmaa_token');
    localStorage.removeItem('pmaa_usuario');
    location.reload();
}

function mostrarApp() {
    const usuario = usuarioAtual();
    if (!usuario) return;

    document.getElementById('tela-login').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('sidebar-usuario').innerHTML =
        '👤 <strong>' + usuario.nome + '</strong><br><small>' +
        (usuario.papel === 'ADMINISTRADOR' ? 'Administrador' : 'Funcionário') + '</small>';

    if (usuario.papel === 'ADMINISTRADOR') {
        document.getElementById('nav-admin').style.display = 'block';
    }
    navegar('dashboard');
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('pmaa_token')) mostrarApp();
});
