const { Pool } = require('pg');

// Configuração do Neon PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event, context) => {
  // Habilitar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { httpMethod, path } = event;

    // GET - Listar usuários ou buscar usuário específico
    if (httpMethod === 'GET') {
      const id = event.queryStringParameters?.id;
      
      if (id) {
        const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        if (result.rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ error: 'Usuário não encontrado' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) };
      }
      
      const result = await pool.query('SELECT * FROM usuarios ORDER BY criado_em DESC');
      return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
    }

    // POST - Criar novo usuário
    if (httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      const { nome, creditos = 0 } = data;
      
      const result = await pool.query(
        'INSERT INTO usuarios (nome, creditos) VALUES ($1, $2) RETURNING *',
        [nome, creditos]
      );
      
      return { statusCode: 201, headers, body: JSON.stringify(result.rows[0]) };
    }

    // PUT - Atualizar usuário
    if (httpMethod === 'PUT') {
      const id = event.queryStringParameters?.id;
      const data = JSON.parse(event.body);
      const { nome, creditos } = data;
      
      const result = await pool.query(
        'UPDATE usuarios SET nome = $1, creditos = $2 WHERE id = $3 RETURNING *',
        [nome, creditos, id]
      );
      
      if (result.rows.length === 0) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Usuário não encontrado' }) };
      }
      
      return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) };
    }

    // DELETE - Deletar usuário
    if (httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id;
      
      const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Usuário não encontrado' }) };
      }
      
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Usuário deletado com sucesso' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };

  } catch (error) {
    console.error('Erro:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erro interno do servidor' }) };
  }
};
