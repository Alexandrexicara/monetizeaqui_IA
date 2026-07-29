const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  try {
    console.log('✅ FUNÇÃO INICIADA');
    const { httpMethod } = event;

    if (httpMethod === 'GET') {
      console.log('Buscando usuários...');
      const res = await pool.query('SELECT id, nome, email, creditos, ativo, criado_em FROM usuarios ORDER BY criado_em DESC');
      return { statusCode: 200, headers, body: JSON.stringify({ sucesso: true, usuarios: res.rows }) };
    }

    if (httpMethod === 'POST') {
      const dados = JSON.parse(event.body);
      const { nome_completo, email, senha } = dados;

      console.log('Cadastro:', { nome, email });

      if (!nome || !email || !senha) {
        return { statusCode: 400, headers, body: JSON.stringify({ sucesso: false, erro: 'Preencha todos os campos' }) };
      }

      const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
      if (existe.rows.length > 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ sucesso: false, erro: 'E-mail já cadastrado' }) };
      }

      const novo = await pool.query(
        'INSERT INTO usuarios (nome_completo, email, senha, creditos) VALUES ($1, $2, $3, 1000) RETURNING id, nome, email, creditos',
        [nome_completo, email, senha]
      );

      return { statusCode: 201, headers, body: JSON.stringify({ sucesso: true, usuario: novo.rows[0] }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ erro: 'Método não permitido' }) };

  } catch (erro) {
    console.error('❌ ERRO GERAL:', erro);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ sucesso: false, erro: erro.message })
    };
  }
};
