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

    if (httpMethod === 'GET') {
      const id = event.queryStringParameters?.id;
      
      if (id) {
        const result = await pool.query('SELECT * FROM admin_links WHERE id = $1', [id]);
        if (result.rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ error: 'Link não encontrado' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) };
      }
      
      const result = await pool.query('SELECT * FROM admin_links ORDER BY criado_em DESC');
      return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
    }

    if (httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      const { titulo, link } = data;
      
      const result = await pool.query(
        'INSERT INTO admin_links (titulo, link) VALUES ($1, $2) RETURNING *',
        [titulo, link]
      );
      
      return { statusCode: 201, headers, body: JSON.stringify(result.rows[0]) };
    }

    if (httpMethod === 'PUT') {
      const id = event.queryStringParameters?.id;
      const data = JSON.parse(event.body);
      const { titulo, link, ativo } = data;
      
      const result = await pool.query(
        'UPDATE admin_links SET titulo = $1, link = $2, ativo = $3 WHERE id = $4 RETURNING *',
        [titulo, link, ativo, id]
      );
      
      if (result.rows.length === 0) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Link não encontrado' }) };
      }
      
      return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) };
    }

    if (httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id;
      
      const result = await pool.query('DELETE FROM admin_links WHERE id = $1 RETURNING *', [id]);
      
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
