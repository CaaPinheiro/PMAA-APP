// Cliente HTTP central com token JWT
async function req(method, url, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    const token = localStorage.getItem('pmaa_token');
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    if (body !== undefined) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);

    if (res.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        sair();
        throw new Error('Não autenticado');
    }
    if (res.status === 403) {
        throw new Error('Acesso negado. Apenas administradores podem executar esta ação.');
    }
    if (res.status === 204) return null;

    const data = await res.json().catch(() => null);
    if (!res.ok) {
        const msg = data && data.mensagem ? data.mensagem : 'Erro ' + res.status;
        throw new Error(msg);
    }
    return data;
}

const apiGet    = (url)       => req('GET', url);
const apiPost   = (url, body) => req('POST', url, body);
const apiPut    = (url, body) => req('PUT', url, body);
const apiDelete = (url)       => req('DELETE', url);
