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

    if (httpMethod === 'GET') {
      console.log('GET request recebido');
      const id = event.queryStringParameters?.id;
      console.log('ID:', id);
      
      if (id) {
        console.log('Buscando link por ID:', id);
        const result = await pool.query('SELECT * FROM links WHERE id = $1', [id]);
        if (result.rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ error: 'Link não encontrado' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) };
      }
      
      console.log('Listando todos os links');
      const result = await pool.query('SELECT * FROM links ORDER BY criado_em DESC');
      console.log('Total links:', result.rows.length);
      return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
    }

    if (httpMethod === 'POST') {
      console.log('POST request recebido');
      const data = JSON.parse(event.body);
      const { titulo, url } = data;
      console.log('Dados do link:', { titulo, url });
      
      const result = await pool.query(
        'INSERT INTO links (titulo, url) VALUES ($1, $2) RETURNING *',
        [titulo, url]
      );
      
      console.log('Link criado:', result.rows[0].id);
      return { statusCode: 201, headers, body: JSON.stringify(result.rows[0]) };
    }

    if (httpMethod === 'PUT') {
      const id = event.queryStringParameters?.id;
      const data = JSON.parse(event.body);
      const { titulo, url, ativo } = data;
      
      const result = await pool.query(
        'UPDATE links SET titulo = $1, link = $2, ativo = $3 WHERE id = $4 RETURNING *',
        [titulo, url, ativo, id]
      );
      
      if (result.rows.length === 0) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Link não encontrado' }) };
      }
      
      return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) };
    }

    if (httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id;
      
      const result = await pool.query('DELETE FROM links WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Link não encontrado' }) };
      }
      
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Link deletado com sucesso' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };

  } catch (error) {
    console.error('Erro:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erro interno do servidor' }) };
  }
};
