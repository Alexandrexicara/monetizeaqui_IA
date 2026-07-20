const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
    const { httpMethod } = event;

    // GET - Listar assinaturas
    if (httpMethod === 'GET') {
      const videoId = event.queryStringParameters?.video_id;
      
      if (videoId) {
        const result = await pool.query('SELECT * FROM assinaturas WHERE video_id = $1 AND ativa = true', [videoId]);
        return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
      }
      
      const result = await pool.query('SELECT * FROM assinaturas ORDER BY data_assinatura DESC');
      return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
    }

    // POST - Criar nova assinatura
    if (httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      const { video_id, plano } = data;
      
      // Verificar se já existe assinatura ativa para este vídeo
      const existing = await pool.query(
        'SELECT * FROM assinaturas WHERE video_id = $1 AND ativa = true',
        [video_id]
      );
      
      if (existing.rows.length > 0) {
        // Atualizar assinatura existente
        const result = await pool.query(
          'UPDATE assinaturas SET plano = $1, ativa = true WHERE id = $2 RETURNING *',
          [plano, existing.rows[0].id]
        );
        return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) };
      }
      
      // Criar nova assinatura
      const result = await pool.query(
        'INSERT INTO assinaturas (video_id, plano) VALUES ($1, $2) RETURNING *',
        [video_id, plano]
      );
      
      return { statusCode: 201, headers, body: JSON.stringify(result.rows[0]) };
    }

    // DELETE - Cancelar assinatura
    if (httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id;
      
      const result = await pool.query(
        'UPDATE assinaturas SET ativa = false WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Assinatura não encontrada' }) };
      }
      
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Assinatura cancelada com sucesso' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };

  } catch (error) {
    console.error('Erro:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erro interno do servidor' }) };
  }
};
