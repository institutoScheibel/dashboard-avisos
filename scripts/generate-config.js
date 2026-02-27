const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config.js');

const url = (process.env.SUPABASE_URL || '').trim();
const key = (process.env.SUPABASE_ANON_KEY || '').trim();

if (!url || !key) {
  console.error('ERRO: SUPABASE_URL e SUPABASE_ANON_KEY devem estar nas variáveis de ambiente do Easypanel.');
  console.error('Vá em App > Environment e adicione as duas variáveis.');
  process.exit(1);
}

const urlStr = JSON.stringify(url);
const keyStr = JSON.stringify(key);

const configContent = `// Gerado automaticamente
const SUPABASE_URL = ${urlStr};
const SUPABASE_ANON_KEY = ${keyStr};
`;

fs.writeFileSync(configPath, configContent);
console.log('config.js gerado com sucesso');
