const { Pool } = require('pg');

// Usa variável de ambiente se disponível, senão usa arquivo local
const connectionString = process.env.DATABASE_URL || require('../../database-config').DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('DATABASE_URL configurada:', !!process.env.DATABASE_URL);
    console.log('Método HTTP:', event.httpMethod);
    
    const { httpMethod } = event;

    // GET - Listar vídeos ou buscar vídeo específico
    if (httpMethod === 'GET') {
      console.log('GET request recebido');
      const id = event.queryStringParameters?.id;
      const criadorId = event.queryStringParameters?.criador_id;
      console.log('ID:', id, 'Criador ID:', criadorId);
      
      if (id) {
        console.log('Buscando vídeo por ID:', id);
        const result = await pool.query('SELECT * FROM videos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ error: 'Vídeo não encontrado' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) };
      }
      
      if (criadorId) {
        console.log('Buscando vídeos do criador:', criadorId);
        const result = await pool.query('SELECT * FROM videos WHERE criador_id = $1 ORDER BY criado_em DESC', [criadorId]);
        console.log('Vídeos encontrados:', result.rows.length);
        return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
      }
      
      console.log('Listando todos os vídeos');
      const result = await pool.query('SELECT * FROM videos ORDER BY criado_em DESC');
      console.log('Total vídeos:', result.rows.length);
      return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
    }

    // POST - Criar novo vídeo
    if (httpMethod === 'POST') {
      console.log('POST request recebido');
      const data = JSON.parse(event.body);
      const { criador_id, nome_criador, titulo, link, visualizacoes = 1000, visualizacoes_automaticas = 1000, bonus_gratis_ativo = true } = data;
      console.log('Dados do vídeo:', { criador_id, nome_criador, titulo, link, visualizacoes });
      
      const result = await pool.query(
        'INSERT INTO videos (criador_id, nome_criador, titulo, link, visualizacoes, visualizacoes_automaticas, bonus_gratis_ativo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [criador_id, nome_criador, titulo, link, visualizacoes, visualizacoes_automaticas, bonus_gratis_ativo]
      );
      
      console.log('Vídeo criado:', result.rows[0].id);
      return { statusCode: 201, headers, body: JSON.stringify(result.rows[0]) };
    }

    // PUT - Atualizar vídeo
    if (httpMethod === 'PUT') {
      const id = event.queryStringParameters?.id;
      const data = JSON.parse(event.body);
      const { titulo, link, visualizacoes, visualizacoes_automaticas, bonus_gratis_ativo, tem_plano } = data;
      
      const result = await pool.query(
        'UPDATE videos SET titulo = $1, link = $2, visualizacoes = $3, visualizacoes_automaticas = $4, bonus_gratis_ativo = $5, tem_plano = $6 WHERE id = $7 RETURNING *',
        [titulo, link, visualizacoes, visualizacoes_automaticas, bonus_gratis_ativo, tem_plano, id]
      );
      
      if (result.rows.length === 0) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Vídeo não encontrado' }) };
      }
      
      return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) };
    }

    // DELETE - Deletar vídeo
    if (httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id;
      
      const result = await pool.query('DELETE FROM videos WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Vídeo não encontrado' }) };
      }
      
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Vídeo deletado com sucesso' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };

  } catch (error) {
    console.error('Erro:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erro interno do servidor' }) };
  }
};
