// API Client para Sistema Kawi
const API_BASE = '/.netlify/functions';

class KawiAPI {
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            // Fallback para localStorage se API falhar
            return this.fallback(endpoint, options);
        }
    }

    // Fallback para localStorage quando API não está disponível
    fallback(endpoint, options) {
        console.warn('Usando localStorage como fallback');
        const STORAGE_VIDEOS = 'kawi_videos';
        const STORAGE_USUARIO = 'kawi_usuario';
        const STORAGE_ASSINATURAS = 'kawi_assinaturas';

        if (endpoint.includes('usuarios')) {
            if (options.method === 'GET') {
                const usuarios = JSON.parse(localStorage.getItem(STORAGE_USUARIO) || '[]');
                return Promise.resolve(usuarios);
            }
            if (options.method === 'POST') {
                const data = JSON.parse(options.body);
                const usuarios = JSON.parse(localStorage.getItem(STORAGE_USUARIO) || '[]');
                usuarios.push(data);
                localStorage.setItem(STORAGE_USUARIO, JSON.stringify(usuarios));
                return Promise.resolve(data);
            }
        }

        if (endpoint.includes('videos')) {
            if (options.method === 'GET') {
                const videos = JSON.parse(localStorage.getItem(STORAGE_VIDEOS) || '[]');
                if (endpoint.includes('criador_id')) {
                    const urlParams = new URLSearchParams(endpoint.split('?')[1]);
                    const criadorId = parseInt(urlParams.get('criador_id'));
                    return Promise.resolve(videos.filter(v => v.criador_id === criadorId));
                }
                return Promise.resolve(videos);
            }
            if (options.method === 'POST') {
                const data = JSON.parse(options.body);
                const videos = JSON.parse(localStorage.getItem(STORAGE_VIDEOS) || '[]');
                videos.push(data);
                localStorage.setItem(STORAGE_VIDEOS, JSON.stringify(videos));
                return Promise.resolve(data);
            }
        }

        if (endpoint.includes('assinaturas')) {
            if (options.method === 'GET') {
                const assinaturas = JSON.parse(localStorage.getItem(STORAGE_ASSINATURAS) || '[]');
                return Promise.resolve(assinaturas);
            }
            if (options.method === 'POST') {
                const data = JSON.parse(options.body);
                const assinaturas = JSON.parse(localStorage.getItem(STORAGE_ASSINATURAS) || '[]');
                const idx = assinaturas.findIndex(a => a.video_id === data.video_id);
                if (idx >= 0) assinaturas[idx] = data;
                else assinaturas.push(data);
                localStorage.setItem(STORAGE_ASSINATURAS, JSON.stringify(assinaturas));
                return Promise.resolve(data);
            }
        }

        return Promise.reject(new Error('Fallback não implementado'));
    }

    // Usuários
    async getUsuarios() {
        return this.request('/usuarios');
    }

    async getUsuario(id) {
        return this.request(`/usuarios?id=${id}`);
    }

    async criarUsuario(nome, creditos = 0) {
        return this.request('/usuarios', {
            method: 'POST',
            body: JSON.stringify({ nome, creditos })
        });
    }

    async atualizarUsuario(id, nome, creditos) {
        return this.request(`/usuarios?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify({ nome, creditos })
        });
    }

    async deletarUsuario(id) {
        return this.request(`/usuarios?id=${id}`, {
            method: 'DELETE'
        });
    }

    // Vídeos
    async getVideos(criadorId = null) {
        if (criadorId) {
            return this.request(`/videos?criador_id=${criadorId}`);
        }
        return this.request('/videos');
    }

    async getVideo(id) {
        return this.request(`/videos?id=${id}`);
    }

    async criarVideo(criadorId, nomeCriador, titulo, link, visualizacoes = 1000, visualizacoesAutomaticas = 1000, bonusGratisAtivo = true) {
        return this.request('/videos', {
            method: 'POST',
            body: JSON.stringify({
                criador_id: criadorId,
                nome_criador: nomeCriador,
                titulo,
                link,
                visualizacoes,
                visualizacoes_automaticas: visualizacoesAutomaticas,
                bonus_gratis_ativo: bonusGratisAtivo
            })
        });
    }

    async atualizarVideo(id, dados) {
        return this.request(`/videos?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(dados)
        });
    }

    async deletarVideo(id) {
        return this.request(`/videos?id=${id}`, {
            method: 'DELETE'
        });
    }

    // Assinaturas
    async getAssinaturas(videoId = null) {
        if (videoId) {
            return this.request(`/assinaturas?video_id=${videoId}`);
        }
        return this.request('/assinaturas');
    }

    async criarAssinatura(videoId, plano) {
        return this.request('/assinaturas', {
            method: 'POST',
            body: JSON.stringify({
                video_id: videoId,
                plano
            })
        });
    }

    async cancelarAssinatura(id) {
        return this.request(`/assinaturas?id=${id}`, {
            method: 'DELETE'
        });
    }

    // Processamento Automático
    async processarAutomatico() {
        return this.request('/processar-automatico', {
            method: 'POST'
        });
    }
}

// Instância global da API
const api = new KawiAPI();
