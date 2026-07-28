// Sistema de Autenticação
const STORAGE_USUARIO = 'kawi_usuario_session';

function verificarAutenticacao() {
    const session = JSON.parse(localStorage.getItem(STORAGE_USUARIO) || 'null');
    if (!session || !session.logado) {
        return false;
    }
    
    // Verificar se a sessão expirou (24 horas)
    const agora = Date.now();
    const tempoSessao = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
    
    if (agora - session.timestamp > tempoSessao) {
        logout();
        return false;
    }
    
    return session.usuario;
}

function logout() {
    localStorage.removeItem(STORAGE_USUARIO);
    window.location.href = 'login.html';
}

function getUsuarioLogado() {
    const session = JSON.parse(localStorage.getItem(STORAGE_USUARIO) || 'null');
    return session ? session.usuario : null;
}

function requerirAutenticacao() {
    const usuario = verificarAutenticacao();
    if (!usuario) {
        alert('⚠️ Você precisa fazer login para acessar esta página.');
        window.location.href = 'login.html';
        return false;
    }
    return usuario;
}

// Atualizar timestamp da sessão quando o usuário interage
function atualizarSessao() {
    const session = JSON.parse(localStorage.getItem(STORAGE_USUARIO) || 'null');
    if (session && session.logado) {
        session.timestamp = Date.now();
        localStorage.setItem(STORAGE_USUARIO, JSON.stringify(session));
    }
}

// Atualizar sessão periodicamente
setInterval(atualizarSessao, 5 * 60 * 1000); // A cada 5 minutos
