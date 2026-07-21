const fs = require('fs');

// planos.html
let content = fs.readFileSync('public/planos.html', 'utf8');
content = content.replace(/<h1>.*?Escolha seu Plano.*?<\/h1>/, '<div style="display:flex; align-items:center; gap:1rem;"><img src="img/logo.png" alt="MONETIZEAQUI-IA" style="height:40px; width:auto;"><h1>🎯 Escolha seu Plano</h1></div>');
fs.writeFileSync('public/planos.html', content, 'utf8');

// painel.html
content = fs.readFileSync('public/painel.html', 'utf8');
content = content.replace(/<h1>.*?MONETIZEAQUI-IA.*?<\/h1>/, '<div style="display:flex; align-items:center; gap:1rem;"><img src="img/logo.png" alt="MONETIZEAQUI-IA" style="height:40px; width:auto;"><h1>🚀 MONETIZEAQUI-IA — 1.000 Visualizações Grátis</h1></div>');
fs.writeFileSync('public/painel.html', content, 'utf8');

console.log('Logo adicionado com sucesso!');
