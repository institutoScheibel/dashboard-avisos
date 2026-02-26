function getPacientesPorDiasAposFinalizacao(dados, opcoes = {}) {
  const {
    marcos = [15, 25, 60, 90, 180, 365],
    porFaixa = true,
    dataReferencia = new Date().toISOString().split('T')[0]
  } = opcoes;

  const referencia = new Date(dataReferencia + 'T12:00:00');
  referencia.setHours(0, 0, 0, 0);

  const raw = Array.isArray(dados) && dados.length > 0 ? dados : [];
  const isN8nItems = raw[0] && raw[0].json !== undefined;
  const payloads = isN8nItems ? raw.map(i => i.json) : raw;
  const agendamentos = payloads[0] && payloads[0].data
    ? payloads.flatMap(item => item.data || [])
    : payloads.flatMap(item => (item && item.data) ? item.data : (item && typeof item === 'object' ? [item] : []));

  const finalizados = agendamentos.filter(a => (a.status || '').toLowerCase() === 'done');
  if (finalizados.length === 0) {
    return Object.fromEntries(marcos.map(m => [m, []]));
  }

  function diasDesdeFinalizacao(agendamento) {
    const dataRef = agendamento.ends_at || agendamento.updated_at || agendamento.created_at;
    if (!dataRef) return null;
    const fim = new Date(dataRef);
    fim.setHours(0, 0, 0, 0);
    const diff = Math.floor((referencia - fim) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : null;
  }

  const ordenados = [...marcos].sort((a, b) => a - b);
  const pacientePorId = new Map();

  for (const ag of finalizados) {
    const dias = diasDesdeFinalizacao(ag);
    if (dias == null || !ag.patient) continue;
    const id = ag.patient.uuid || ag.patient.id || ag.patient.email || ag.patient.name;
    if (!id) continue;
    const atual = pacientePorId.get(id);
    if (!atual || dias < atual._diasAposFinalizacao) {
      pacientePorId.set(id, { ...ag.patient, _diasAposFinalizacao: dias, _agendamento: ag });
    }
  }

  const resultado = {};
  const limites = [...ordenados];

  if (porFaixa) {
    for (let i = 0; i < limites.length; i++) {
      const minDias = limites[i];
      const maxDias = i < limites.length - 1 ? limites[i + 1] - 1 : Infinity;
      resultado[minDias] = [];
      for (const p of pacientePorId.values()) {
        const d = p._diasAposFinalizacao;
        if (d >= minDias && d <= maxDias) resultado[minDias].push(p);
      }
    }
  } else {
    for (const minDias of limites) resultado[minDias] = [];
    for (const p of pacientePorId.values()) {
      const d = p._diasAposFinalizacao;
      const marco = [...limites].reverse().find(m => d >= m);
      if (marco != null) resultado[marco].push(p);
    }
  }

  return resultado;
}

function getPacientesComFinalizacaoHaXDias(dados, dias, tolerancia = 2) {
  const ref = new Date();
  ref.setHours(0, 0, 0, 0);
  const raw = Array.isArray(dados) && dados.length > 0 ? dados : [];
  const isN8nItems = raw[0] && raw[0].json !== undefined;
  const payloads = isN8nItems ? raw.map(i => i.json) : raw;
  const agendamentos = payloads[0] && payloads[0].data
    ? payloads.flatMap(item => item.data || [])
    : payloads.flatMap(item => (item && item.data) ? item.data : (item && typeof item === 'object' ? [item] : []));
  const finalizados = agendamentos.filter(a => (a.status || '').toLowerCase() === 'done');
  const minDias = Math.max(0, dias - tolerancia);
  const maxDias = dias + tolerancia;
  const mapa = new Map();
  for (const ag of finalizados) {
    const dataRef = ag.ends_at || ag.updated_at || ag.created_at;
    if (!dataRef || !ag.patient) continue;
    const fim = new Date(dataRef);
    fim.setHours(0, 0, 0, 0);
    const d = Math.floor((ref - fim) / (1000 * 60 * 60 * 24));
    if (d >= minDias && d <= maxDias) {
      const id = ag.patient.uuid || ag.patient.id || ag.patient.email || ag.patient.name;
      if (id && !mapa.has(id)) mapa.set(id, { ...ag.patient, _diasAposFinalizacao: d, _agendamento: ag });
    }
  }
  return Array.from(mapa.values());
}

function resultParaN8n(resultado) {
  const items = [];
  for (const [dias, pacientes] of Object.entries(resultado)) {
    const diasStr = String(dias);
    for (const paciente of pacientes) {
      items.push({ json: { dias: diasStr, paciente } });
    }
  }
  return items;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getPacientesPorDiasAposFinalizacao, getPacientesComFinalizacaoHaXDias, resultParaN8n };
}

if (typeof $input !== 'undefined') {
  return resultParaN8n(getPacientesPorDiasAposFinalizacao($input.all(), { porFaixa: true }));
}
