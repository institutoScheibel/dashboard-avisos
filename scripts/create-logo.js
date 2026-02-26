const fs = require('fs');
const path = require('path');

// Lê o base64 do arquivo logo-base64.txt (apenas o conteúdo, sem "data:image/png;base64,")
const base64Path = path.join(__dirname, '..', 'logo-base64.txt');
let base64 = '';
if (fs.existsSync(base64Path)) {
  base64 = fs.readFileSync(base64Path, 'utf8').trim();
}
if (!base64) {
  console.log('Crie o arquivo logo-base64.txt com o conteúdo base64 da imagem PNG.');
  console.log('Extraia o texto entre base64, e " do SVG fornecido.');
  process.exit(1);
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg style="max-width: 140px; height: auto; display: block;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="2501" height="2084" viewBox="0 0 2501 2084">
  <image width="2501" height="2084"
         xlink:href="data:image/png;base64,${base64}"/>
</svg>`;

const outPath = path.join(__dirname, '..', 'logo.svg');
fs.writeFileSync(outPath, svg);
console.log('logo.svg criado com sucesso');
