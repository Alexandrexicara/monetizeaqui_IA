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
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
    }

    // Buscar todos os vídeos com bônus ativo
    const videosResult = await pool.query(
      'SELECT * FROM videos WHERE bonus_gratis_ativo = true AND visualizacoes_automaticas > 0'
    );

    let totalProcessado = 0;

    for (const video of videosResult.rows) {
      const adicionar = Math.min(50, video.visualizacoes_automaticas);
      
      await pool.query(
        'UPDATE videos SET visualizacoes = visualizacoes + $1, visualizacoes_automaticas = visualizacoes_automaticas - $1 WHERE id = $2',
        [adicionar, video.id]
      );
      
      totalProcessado += adicionar;
    }

    // Processar planos pagos
    const assinaturasResult = await pool.query(
      'SELECT a.*, v.id as video_id FROM assinaturas a JOIN videos v ON a.video_id = v.id WHERE a.ativa = true'
    );

    for (const assinatura of assinaturasResult.rows) {
      const planoDiario = assinatura.plano === 'p5000' ? 5000 : 1000;
      
      await pool.query(
        'UPDATE videos SET visualizacoes = visualizacoes + $1 WHERE id = $2',
        [planoDiario, assinatura.video_id]
      );
      
      totalProcessado += planoDiario;
    }

    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ 
        message: 'Processamento concluído',
        videos_processados: videosResult.rows.length,
        assinaturas_processadas: assinaturasResult.rows.length,
        total_visualizacoes: totalProcessado
      }) 
    };

  } catch (error) {
    console.error('Erro:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erro interno do servidor' }) };
  }
};
