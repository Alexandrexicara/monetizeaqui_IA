// ==============================================
// SISTEMA MONETIZEAQUI-IA - DISTRIBUIÇÃO COMPLETA
// ==============================================

// CONFIGURAÇÕES
const TOTAL_AUTOMATICO = 1000;
const VIS_ADMIN_AUTOMATICO = 100;
const VIS_ADMIN_POR_CLIQUE_MANUAL = 1;

// ==============================================
// 1. DISTRIBUIÇÃO AUTOMÁTICA (1.000 grátis)
// ==============================================
async function gerarDistribuicaoAutomatica(videosUsuarios) {
  let lista = [];
  
  // Buscar links do admin da API
  let adminLinks = [];
  try {
    adminLinks = await api.getAdminLinks();
  } catch (error) {
    console.error('Erro ao buscar links do admin:', error);
  }
  
  // Se não houver links do admin, usar array vazio
  if (!adminLinks || adminLinks.length === 0) {
    console.warn('Nenhum link do admin configurado');
  }
  
  // Adicionar visualizações dos links do admin
  for(let i = 0; i < VIS_ADMIN_AUTOMATICO; i++) {
    if (adminLinks.length > 0) {
      const randomLink = adminLinks[Math.floor(Math.random() * adminLinks.length)];
      lista.push({ link: randomLink.link, tipo: "admin", origem: "automatico", adminLinkId: randomLink.id });
    }
  }
  
  // Completar com vídeos dos usuários
  while(lista.length < TOTAL_AUTOMATICO && videosUsuarios.length > 0) {
    const video = videosUsuarios[Math.floor(Math.random() * videosUsuarios.length)];
    lista.push({ link: video.link, tipo: "usuario", origem: "automatico" });
  }
  
  return lista.sort(() => Math.random() - 0.5);
}

// ==============================================
// 2. PROCESSAR CLIQUE MANUAL
// ==============================================
async function processarCliqueManual(linkDoUsuario) {
  let listaClique = [
    { link: linkDoUsuario, tipo: "usuario", origem: "manual" }
  ];
  
  // Buscar links do admin da API
  let adminLinks = [];
  try {
    adminLinks = await api.getAdminLinks();
  } catch (error) {
    console.error('Erro ao buscar links do admin:', error);
  }
  
  // Se houver links do admin, adicionar um aleatório
  if (adminLinks.length > 0) {
    const randomLink = adminLinks[Math.floor(Math.random() * adminLinks.length)];
    listaClique.push({ link: randomLink.link, tipo: "admin", origem: "manual", adminLinkId: randomLink.id });
  }
  
  listaClique = listaClique.sort(() => Math.random() - 0.5);
  return { linksDistribuidos: listaClique, creditoGanho: 1, visAdminAdicionada: adminLinks.length > 0 ? 1 : 0 };
}

if (typeof module !== 'undefined') {
  module.exports = { gerarDistribuicaoAutomatica, processarCliqueManual };
}
