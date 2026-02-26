-- Tabela para registrar avisos enviados aos pacientes (evitar repetir)
-- Supabase / PostgreSQL
-- Um registro por paciente + marco de dias (15, 25, 60, 90, 180, 365)

CREATE TABLE aviso_paciente (
  id                BIGSERIAL PRIMARY KEY,
  paciente_uuid     VARCHAR(36)   NOT NULL,
  email             VARCHAR(255)  NULL,
  dias              VARCHAR(10)   NOT NULL,
  status            VARCHAR(20)   NOT NULL DEFAULT 'nao_enviado',
  enviado_em        TIMESTAMPTZ   NULL,
  criado_em         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  atualizado_em     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (paciente_uuid, dias)
);

CREATE INDEX idx_aviso_status ON aviso_paciente (status);
CREATE INDEX idx_aviso_paciente_uuid ON aviso_paciente (paciente_uuid);
CREATE INDEX idx_aviso_email ON aviso_paciente (email);
CREATE INDEX idx_aviso_dias ON aviso_paciente (dias);

-- Trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER aviso_paciente_atualizado_em
  BEFORE UPDATE ON aviso_paciente
  FOR EACH ROW
  EXECUTE PROCEDURE update_atualizado_em();

-- Exemplos de uso (Supabase / n8n):
-- Buscar por email: SELECT * FROM aviso_paciente WHERE email = $1;
-- Verificar se já enviou (por email): SELECT 1 FROM aviso_paciente WHERE email = $1 AND dias = $2 AND status = 'enviado' LIMIT 1;
-- Inserir (email pode ser NULL): INSERT INTO aviso_paciente (paciente_uuid, email, dias, status) VALUES ($1, $2, $3, 'nao_enviado') ON CONFLICT (paciente_uuid, dias) DO NOTHING;
-- Marcar como enviado (por email, se preenchido): UPDATE aviso_paciente SET status = 'enviado', enviado_em = NOW() WHERE email = $1 AND dias = $2;
-- Buscar por email (ignorar NULL): SELECT * FROM aviso_paciente WHERE email IS NOT NULL AND email = $1;

-- ========== ALTER TABLE (tabela já criada: permitir NULL em email) ==========
ALTER TABLE aviso_paciente ALTER COLUMN email DROP NOT NULL;
