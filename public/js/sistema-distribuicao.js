// ==============================================
// SISTEMA DE DISTRIBUIÇÃO COMPLETO
// ==============================================

// CONFIGURAÇÕES
const LINK_ADMIN = "COLOQUE_SEU_LINK_AQUI"; // Troque pelo seu link real
const TOTAL_AUTOMATICO = 1000;
const VIS_ADMIN_AUTOMATICO = 100;
const VIS_ADMIN_POR_CLIQUE_MANUAL = 1;

// ==============================================
// 1. DISTRIBUIÇÃO AUTOMÁTICA (1.000 grátis)
// ==============================================
function gerarDistribuicaoAutomatica(videosUsuarios) {
  let lista = [];

  // Adiciona as 100 visualizações do admin
  for(let i = 0; i < VIS_ADMIN_AUTOMATICO; i++) {
    lista.push({
      link: LINK_ADMIN,
      tipo: "admin",
      origem: "automatico"
    });
  }

  // Adiciona as 900 restantes dos usuários
  while(lista.length < TOTAL_AUTOMATICO) {
    const video = videosUsuarios[Math.floor(Math.random() * videosUsuarios.length)];
    lista.push({
      link: video.link,
      tipo: "usuario",
      origem: "automatico"
    });
  }

  // EMBARALHA TUDO — NÃO FICA JUNTO
  return lista.sort(() => Math.random() - 0.5);
}

// ==============================================
// 2. PROCESSAR CLIQUE MANUAL DO USUÁRIO
// ==============================================
function processarCliqueManual(linkDoUsuario) {
  let listaClique = [];

  // Adiciona a visualização para o dono do vídeo
  listaClique.push({
    link: linkDoUsuario,
    tipo: "usuario",
    origem: "manual"
  });

  // Adiciona MAIS 1 para o ADMIN
  listaClique.push({
    link: LINK_ADMIN,
    tipo: "admin",
    origem: "manual"
  });

  // Embaralha os dois para não ficar na ordem óbvia
  listaClique = listaClique.sort(() => Math.random() - 0.5);

  // Atualiza contadores
  return {
    linksDistribuidos: listaClique,
    creditoGanho: 1,
    visAdminAdicionada: 1
  };
}

// Exporta funções para o painel
if (typeof module !== 'undefined') {
  module.exports = {
    gerarDistribuicaoAutomatica,
    processarCliqueManual
  };
}
