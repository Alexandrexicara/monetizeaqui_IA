exports.handler = async (event) => {
  try {exports.handler = async (event) => {
  try {
    // SEU CÓDIGO ORIGINAL AQUI
  } catch (erro) {
    console.error("ERRO:", erro);
    return {
      statusCode: 500,
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        sucesso: false,
        mensagem: erro.message || "Erro interno",
        detalhes: erro.stack || ""
      })
    };
  }
};
  } catch (error) {
    console.error("ERRO COMPLETO:", error);
    console.error(error.stack);
    return {
      statusCode: 500,
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({sucesso: false, erro: error.message, stack: error.stack})
    };
  }
};
