const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3333;

const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE || 'avisos_pacientes',
});

app.get('/api/debug', async (req, res) => {
  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM aviso_paciente');
    const tablesResult = await pool.query(
      "SELECT table_schema, table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog', 'information_schema') ORDER BY table_schema, table_name"
    );
    res.json({
      conexao: { host: process.env.PG_HOST, database: process.env.PG_DATABASE },
      count_aviso_paciente: parseInt(countResult.rows[0].count, 10),
      tabelas: tablesResult.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/avisos', async (req, res) => {
  try {
    const schema = (process.env.PG_SCHEMA || 'public').replace(/[^a-zA-Z0-9_]/g, '');
    const tableName = schema ? `"${schema}".aviso_paciente` : 'aviso_paciente';
    const result = await pool.query(
      `SELECT * FROM ${tableName} ORDER BY criado_em DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar avisos:', err);
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
