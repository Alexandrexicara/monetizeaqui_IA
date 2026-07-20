# Sistema Kawi - Visualizações Automáticas

Sistema de visualizações automáticas para vídeos com dashboard de usuário e admin, integrado com PostgreSQL (Neon).

## 🚀 Funcionalidades

- **Dashboard do Usuário**: Visualização de cliques automáticos em tempo real
- **Dashboard do Admin**: Gerenciamento completo de usuários
- **Sistema de Planos**: +1.000/dia ou +5.000/dia
- **Bônus Grátis**: 1.000 visualizações automáticas ao cadastrar vídeo
- **PostgreSQL**: Banco de dados real via Neon

## 📋 Pré-requisitos

- Node.js instalado
- Conta no [Neon](https://console.neon.tech/)
- Conta no [Netlify](https://app.netlify.com)

## 🔧 Configuração

### 1. Configurar Neon PostgreSQL

1. Acesse https://console.neon.tech/
2. Crie um projeto gratuito
3. Copie a connection string (exemplo):
   ```
   postgresql://usuario:senha@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Configurar Variáveis de Ambiente no Netlify

1. No painel do Netlify, vá em Site settings → Environment variables
2. Adicione a variável:
   - **Key**: `DATABASE_URL`
   - **Value**: Sua connection string do Neon

### 3. Executar Schema do Banco de Dados

No console do Neon (SQL Editor), execute o conteúdo do arquivo `database-schema.sql`:

```sql
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
    plano VARCHAR(20) NOT NULL,
    data_assinatura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativa BOOLEAN DEFAULT TRUE
);
```

### 4. Instalar Dependências

```bash
npm install
```

### 5. Deploy no Netlify

#### Via GitHub (Recomendado)

1. Faça push do projeto para GitHub
2. No Netlify: "Add new site" → "Import an existing project"
3. Conecte GitHub e selecione o repositório
4. Configure:
   - **Build command**: `npm install`
   - **Publish directory**: `public`
5. Adicione a variável `DATABASE_URL` nas environment variables
6. Deploy

#### Via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## 📡 API Endpoints

### Usuários
- `GET /.netlify/functions/usuarios` - Listar todos
- `GET /.netlify/functions/usuarios?id=1` - Buscar usuário
- `POST /.netlify/functions/usuarios` - Criar usuário
- `PUT /.netlify/functions/usuarios?id=1` - Atualizar usuário
- `DELETE /.netlify/functions/usuarios?id=1` - Deletar usuário

### Vídeos
- `GET /.netlify/functions/videos` - Listar todos
- `GET /.netlify/functions/videos?criador_id=1` - Vídeos do usuário
- `POST /.netlify/functions/videos` - Criar vídeo
- `PUT /.netlify/functions/videos?id=1` - Atualizar vídeo
- `DELETE /.netlify/functions/videos?id=1` - Deletar vídeo

### Assinaturas
- `GET /.netlify/functions/assinaturas` - Listar todas
- `GET /.netlify/functions/assinaturas?video_id=1` - Assinatura do vídeo
- `POST /.netlify/functions/assinaturas` - Criar assinatura
- `DELETE /.netlify/functions/assinaturas?id=1` - Cancelar assinatura

### Processamento Automático
- `POST /.netlify/functions/processar-automatico` - Processar cliques automáticos

## 🔐 Credenciais Admin

- **Usuário**: `admin@sistema.com`
- **Senha**: `celio48`

## 📁 Estrutura do Projeto

```
crieite_click/
├── public/
│   ├── index.html              # Página principal
│   ├── dashboard.html          # Dashboard do usuário
│   ├── cadastro.html           # Cadastro de vídeos
│   ├── planos.html             # Planos de assinatura
│   ├── admin-login.html        # Login do admin
│   └── admin-dashboard.html    # Dashboard do admin
├── netlify/
│   └── functions/
│       ├── usuarios.js         # API de usuários
│       ├── videos.js           # API de vídeos
│       ├── assinaturas.js      # API de assinaturas
│       └── processar-automatico.js  # Processamento automático
├── database-schema.sql         # Schema do banco
├── package.json
├── netlify.toml
└── README.md
```

## 🔄 Processamento Automático

O sistema processa cliques automáticos:
- **Bônus grátis**: 50 cliques a cada processamento (máximo 1.000)
- **Planos pagos**: 1.000 ou 5.000 cliques por dia

Para processar automaticamente, configure um cron job no Netlify ou chame o endpoint `POST /.netlify/functions/processar-automatico`.

## 📝 Notas

- O sistema usa localStorage como fallback se a API não estiver disponível
- Para produção, configure o processamento automático via Netlify Scheduled Functions
- As credenciais do admin devem ser alteradas em produção
