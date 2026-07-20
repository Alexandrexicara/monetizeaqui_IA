-- Schema do Banco de Dados PostgreSQL para Sistema Kawi

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    creditos INTEGER DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de vídeos
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    criador_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    nome_criador VARCHAR(100) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    link TEXT NOT NULL,
    visualizacoes INTEGER DEFAULT 0,
    visualizacoes_automaticas INTEGER DEFAULT 0,
    tem_plano BOOLEAN DEFAULT FALSE,
    bonus_gratis_ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS assinaturas (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    plano VARCHAR(20) NOT NULL, -- 'p1000' ou 'p5000'
    data_assinatura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativa BOOLEAN DEFAULT TRUE
);

-- Tabela de links do admin
CREATE TABLE IF NOT EXISTS admin_links (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    link TEXT NOT NULL,
    visualizacoes_totais INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de distribuição de links (links do admin para usuários)
CREATE TABLE IF NOT EXISTS usuario_links (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    admin_link_id INTEGER REFERENCES admin_links(id) ON DELETE CASCADE,
    visualizacoes INTEGER DEFAULT 0,
    data_distribuicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, admin_link_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_videos_criador ON videos(criador_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_video ON assinaturas(video_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_ativa ON assinaturas(ativa);
CREATE INDEX IF NOT EXISTS idx_admin_links_ativo ON admin_links(ativo);
CREATE INDEX IF NOT EXISTS idx_usuario_links_usuario ON usuario_links(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_links_admin_link ON usuario_links(admin_link_id);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamp automaticamente
CREATE TRIGGER trigger_usuarios_atualizado
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_videos_atualizado
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_admin_links_atualizado
    BEFORE UPDATE ON admin_links
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();
