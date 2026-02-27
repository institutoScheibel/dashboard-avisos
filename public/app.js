const MARCOS = ['15', '25', '60', '90', '180', '365'];

let allData = [];

const elements = {
  tableBody: document.getElementById('table-body'),
  emptyState: document.getElementById('empty-state'),
  statTotal: document.getElementById('stat-total'),
  statPending: document.getElementById('stat-pending'),
  statSent: document.getElementById('stat-sent'),
  filterStatus: document.getElementById('filter-status'),
  filterDias: document.getElementById('filter-dias'),
  filterOrder: document.getElementById('filter-order'),
  btnClearFilters: document.getElementById('btn-clear-filters'),
};

function truncateUuid(uuid) {
  if (!uuid) return '-';
  return uuid.length > 12 ? `${uuid.slice(0, 8)}...` : uuid;
}

function formatDate(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadge(status) {
  const isSent = (status || '').toLowerCase() === 'enviado';
  const label = isSent ? 'Enviado' : 'Pendente';
  const cls = isSent ? 'badge badge-sent' : 'badge badge-pending';
  return `<span class="${cls}">${label}</span>`;
}

function renderTable(data) {
  if (!data || data.length === 0) {
    elements.tableBody.innerHTML = '';
    elements.tableBody.closest('.table-container').style.display = 'none';
    elements.emptyState.style.display = 'block';
    return;
  }

  elements.tableBody.closest('.table-container').style.display = 'block';
  elements.emptyState.style.display = 'none';

  elements.tableBody.innerHTML = data
    .map(
      (row) => `
    <tr>
      <td class="uuid-cell">${truncateUuid(row.paciente_uuid)}</td>
      <td>${row.email || '-'}</td>
      <td>${row.dias || '-'} dias</td>
      <td>${getStatusBadge(row.status)}</td>
      <td>${formatDate(row.enviado_em)}</td>
      <td>${formatDate(row.criado_em)}</td>
    </tr>
  `
    )
    .join('');
}

function updateStats(data) {
  const total = data.length;
  const pending = data.filter((r) => (r.status || '').toLowerCase() !== 'enviado').length;
  const sent = total - pending;

  elements.statTotal.textContent = total;
  elements.statPending.textContent = pending;
  elements.statSent.textContent = sent;
}

function applyFilters() {
  const statusFilter = elements.filterStatus.value;
  const diasFilter = elements.filterDias.value;
  const orderValue = elements.filterOrder.value;

  let filtered = [...allData];

  if (statusFilter) {
    filtered = filtered.filter((r) => (r.status || '').toLowerCase() === statusFilter);
  }

  if (diasFilter) {
    filtered = filtered.filter((r) => String(r.dias) === diasFilter);
  }

  const [orderBy, orderDir] = orderValue.split('-');
  filtered.sort((a, b) => {
    let va = a[orderBy];
    let vb = b[orderBy];

    if (orderBy === 'criado_em' || orderBy === 'enviado_em') {
      va = va ? new Date(va).getTime() : 0;
      vb = vb ? new Date(vb).getTime() : 0;
    }
    if (orderBy === 'dias') {
      va = parseInt(va, 10) || 0;
      vb = parseInt(vb, 10) || 0;
    }

    if (orderDir === 'asc') return va > vb ? 1 : va < vb ? -1 : 0;
    return va < vb ? 1 : va > vb ? -1 : 0;
  });

  renderTable(filtered);
  updateStats(filtered);
}

async function fetchData() {
  elements.tableBody.innerHTML = '<tr class="loading-row"><td colspan="6">Carregando...</td></tr>';
  elements.emptyState.style.display = 'none';

  try {
    const res = await fetch('/api/avisos');
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    allData = data || [];
  } catch (err) {
    elements.tableBody.innerHTML = `<tr class="loading-row"><td colspan="6">Erro: ${err.message}</td></tr>`;
    return;
  }

  applyFilters();
}

function clearFilters() {
  elements.filterStatus.value = '';
  elements.filterDias.value = '';
  elements.filterOrder.value = 'criado_em-desc';
  applyFilters();
}

elements.filterStatus.addEventListener('change', applyFilters);
elements.filterDias.addEventListener('change', applyFilters);
elements.filterOrder.addEventListener('change', applyFilters);
elements.btnClearFilters.addEventListener('click', clearFilters);

fetchData();
