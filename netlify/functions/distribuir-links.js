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
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { httpMethod } = event;

    // GET - Listar links distribuídos para um usuário
    if (httpMethod === 'GET') {
      const usuarioId = event.queryStringParameters?.usuario_id;
      const adminLinkId = event.queryStringParameters?.admin_link_id;
      
      if (usuarioId) {
        const result = await pool.query(
          'SELECT ul.*, al.titulo, al.link, al.ativo FROM usuario_links ul JOIN admin_links al ON ul.admin_link_id = al.id WHERE ul.usuario_id = $1',
          [usuarioId]
        );
        return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
      }
      
      if (adminLinkId) {
        const result = await pool.query(
          'SELECT ul.*, u.nome, u.email FROM usuario_links ul JOIN usuarios u ON ul.usuario_id = u.id WHERE ul.admin_link_id = $1',
          [adminLinkId]
        );
        return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
      }
      
      // Listar todas as distribuições
      const result = await pool.query(
        'SELECT ul.*, u.nome as usuario_nome, al.titulo as link_titulo FROM usuario_links ul JOIN usuarios u ON ul.usuario_id = u.id JOIN admin_links al ON ul.admin_link_id = al.id ORDER BY ul.data_distribuicao DESC'
      );
      return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
    }

    // POST - Distribuir link para usuário
    if (httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      const { usuario_id, admin_link_id } = data;
      
      // Verificar se já existe distribuição
      const existing = await pool.query(
        'SELECT * FROM usuario_links WHERE usuario_id = $1 AND admin_link_id = $2',
        [usuario_id, admin_link_id]
      );
      
      if (existing.rows.length > 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Link já distribuído para este usuário' }) };
      }
      
      // Verificar se o link do admin está ativo
      const adminLink = await pool.query('SELECT * FROM admin_links WHERE id = $1 AND ativo = true', [admin_link_id]);
      if (adminLink.rows.length === 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Link do admin não encontrado ou inativo' }) };
      }
      
      // Criar distribuição
      const result = await pool.query(
        'INSERT INTO usuario_links (usuario_id, admin_link_id) VALUES ($1, $2) RETURNING *',
        [usuario_id, admin_link_id]
      );
      
      return { statusCode: 201, headers, body: JSON.stringify(result.rows[0]) };
    }

    // DELETE - Remover distribuição
    if (httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id;
      
      const result = await pool.query('DELETE FROM usuario_links WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Distribuição não encontrada' }) };
      }
      
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Distribuição removida com sucesso' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };

  } catch (error) {
    console.error('Erro:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erro interno do servidor' }) };
  }
};
