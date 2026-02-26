-- ============================================================
-- Nó POSTGRES no n8n – upsert e update para aviso_paciente
-- ============================================================
-- Use o nó "Postgres" (ou "Postgres node") com Operation: "Execute Query"
-- e cole a query no campo de query. Ajuste as expressões ao nome do seu
-- nó de loop (ex.: "Loop Over Items").
-- ============================================================

-- ------------------------------------------------------------
-- 1) UPSERT: antes de enviar (substitui o CadastraNotificacao)
--    Garante um registro (paciente_uuid, dias); se já existir, só atualiza.
-- ------------------------------------------------------------

-- Use o item do loop para garantir paciente + dias corretos (o nó pode receber item do Supabase).
INSERT INTO aviso_paciente (paciente_uuid, email, dias, status)
VALUES (
  '{{ $("Loop Over Items").item.json.paciente.uuid }}',
  '{{ $("Loop Over Items").item.json.paciente.email }}',
  '{{ $("Loop Over Items").item.json.dias }}',
  'nao_enviado'
)
ON CONFLICT (paciente_uuid, dias)
DO UPDATE SET
  email = EXCLUDED.email,
  status = 'nao_enviado',
  atualizado_em = NOW();


-- ------------------------------------------------------------
-- 2) UPDATE: depois de enviar o WhatsApp (marcar como enviado)
--    Coloque este nó após FollowUPPaciente / FollowUPPaciente365Dias.
-- ------------------------------------------------------------

UPDATE aviso_paciente
SET status = 'enviado', enviado_em = NOW()
WHERE paciente_uuid = '{{ $("Loop Over Items").item.json.paciente.uuid }}'
  AND dias = '{{ $("Loop Over Items").item.json.dias }}';
