// Cliente HTTP central: anexa o token JWT e trata os erros da API.
async function req(metodo, url, corpo) {
    const opcoes = { method: metodo, headers: { 'Content-Type': 'application/json' } };
    const token = localStorage.getItem('integrapmaa_token');
    if (token) opcoes.headers['Authorization'] = 'Bearer ' + token;
    if (corpo !== undefined) opcoes.body = JSON.stringify(corpo);

    let resposta;
    try {
        resposta = await fetch(url, opcoes);
    } catch (e) {
        throw new Error('Nao foi possivel falar com o servidor. Ele ainda esta rodando?');
    }

    if (resposta.status === 401) {
        sair('Sua sessao expirou. Entre novamente.');
        throw new Error('Sessao expirada');
    }
    if (resposta.status === 403) {
        throw new Error('Acesso negado. Esta operação exige perfil de administrador.');
    }
    if (resposta.status === 204) return null;

    const dados = await resposta.json().catch(() => null);
    if (!resposta.ok) {
        throw new Error((dados && dados.mensagem) || ('Erro ' + resposta.status));
    }
    return dados;
}

const apiGet    = (url)        => req('GET', url);
const apiPost   = (url, corpo) => req('POST', url, corpo);
const apiPut    = (url, corpo) => req('PUT', url, corpo);
const apiDelete = (url)        => req('DELETE', url);
