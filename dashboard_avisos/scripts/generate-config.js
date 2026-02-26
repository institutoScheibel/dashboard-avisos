const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const configPath = path.join(__dirname, '..', 'config.js');

function loadEnv() {
  const env = {};
  if (!fs.existsSync(envPath)) {
    console.warn('Arquivo .env não encontrado. Copie .env.example para .env e preencha as credenciais.');
    return env;
  }
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      env[key] = value;
    }
  });
  return env;
}

const env = loadEnv();
const url = (env.SUPABASE_URL || '').trim();
const key = (env.SUPABASE_ANON_KEY || '').trim();

const urlStr = url.startsWith('http') ? JSON.stringify(url) : "''";
const keyStr = key.length > 10 ? JSON.stringify(key) : "''";

const configContent = `// Gerado automaticamente - não editar. Use .env
const SUPABASE_URL = ${urlStr};
const SUPABASE_ANON_KEY = ${keyStr};
`;

fs.writeFileSync(configPath, configContent);
console.log('config.js gerado a partir de .env');
