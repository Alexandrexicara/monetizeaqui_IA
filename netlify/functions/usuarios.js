const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

exports.handler = async (event) => {
  try {
    // Lista TODAS as tabelas
    const todasTabelas = await pool.query(`
      SELECT schemaname, tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    console.log("=== TODAS TABELAS NO BANCO ===");
    console.table(todasTabelas.rows);
    // Verifica banco e tabelas existentes
    const dbInfo = await pool.query("SELECT current_database(), current_schema()");
    console.log("BANCO E SCHEMA:", dbInfo.rows);
    const listaTabelas = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log("TABELAS EXISTENTES:", listaTabelas.rows);
    // === COLA AQUI TODO O SEU CÓDIGO ORIGINAL ===

  } catch (error) {
    console.error("========== ERRO ==========");
    console.error(error);
    console.error("Mensagem:", error.message);
    console.error("Código:", error.code);
    console.error("Detalhe:", error.detail);
    console.error("Stack:", error.stack);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        erro: error.message,
        codigo: error.code,
        detalhe: error.detail
      })
    };
  }
};
