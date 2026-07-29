exports.handler = async (event) => {
  try {
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
