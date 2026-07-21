// ==============================================
// SISTEMA MONETIZEAQUI-IA - DISTRIBUIÇÃO COMPLETA
// ==============================================

// CONFIGURAÇÕES
const LINK_ADMIN = "COLOQUE_SEU_LINK_AQUI";
const TOTAL_AUTOMATICO = 1000;
const VIS_ADMIN_AUTOMATICO = 100;
const VIS_ADMIN_POR_CLIQUE_MANUAL = 1;

// ==============================================
// 1. DISTRIBUIÇÃO AUTOMÁTICA (1.000 grátis)
// ==============================================
function gerarDistribuicaoAutomatica(videosUsuarios) {
  let lista = [];
  for(let i = 0; i < VIS_ADMIN_AUTOMATICO; i++) {
    lista.push({ link: LINK_ADMIN, tipo: "admin", origem: "automatico" });
  }
  while(lista.length < TOTAL_AUTOMATICO) {
    const video = videosUsuarios[Math.floor(Math.random() * videosUsuarios.length)];
    lista.push({ link: video.link, tipo: "usuario", origem: "automatico" });
  }
  return lista.sort(() => Math.random() - 0.5);
}

// ==============================================
// 2. PROCESSAR CLIQUE MANUAL
// ==============================================
function processarCliqueManual(linkDoUsuario) {
  let listaClique = [
    { link: linkDoUsuario, tipo: "usuario", origem: "manual" },
    { link: LINK_ADMIN, tipo: "admin", origem: "manual" }
  ];
  listaClique = listaClique.sort(() => Math.random() - 0.5);
  return { linksDistribuidos: listaClique, creditoGanho: 1, visAdminAdicionada: 1 };
}

if (typeof module !== 'undefined') {
  module.exports = { gerarDistribuicaoAutomatica, processarCliqueManual };
}
