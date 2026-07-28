-- Script para atualizar a tabela de usuários no banco de dados Neon
-- Adiciona campos de email e senha à tabela existente

-- Adicionar colunas email e senha se não existirem
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS senha VARCHAR(255);

-- Criar índice para email para melhorar performance de busca
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Opcional: Adicionar constraint para garantir que email não seja nulo
-- ALTER TABLE usuarios ALTER COLUMN email SET NOT NULL;
