async function requisicao(url, opcoes = {}) {
  try {
    const res = await fetch(url, opcoes);
    if (!res.ok) {
      let err;
      try { err = await res.json(); }
      catch { err = {mensagem: await res.text()}; }
      throw new Error(`❌ ${err.mensagem}\nCódigo: ${res.status}\nDetalhes: ${err.detalhes||""}`);
    }
    return await res.json();
  } catch (e) {
    console.error(e);
    const el = document.getElementById("erro");
    if(el) el.innerHTML = `<pre>${e.message}</pre>`;
    throw e;
  }
}
