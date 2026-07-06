const BASE = '/api/notebooks';

export async function getNotebooks() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error(`Failed to fetch notebooks: ${res.statusText}`);
  return res.json();
}

export async function createNotebook(name, colorTag = '#FF69B4', icon = null) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, colorTag, icon }),
  });
  if (!res.ok) throw new Error(`Failed to create notebook: ${res.statusText}`);
  return res.json();
}

export async function updateNotebook(id, patch) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Failed to update notebook: ${res.statusText}`);
  return res.json();
}

export async function deleteNotebook(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) throw new Error(`Failed to delete notebook: ${res.statusText}`);
}

export async function exportNotebook(id) {
  const res = await fetch(`${BASE}/${id}/export`);
  if (!res.ok) throw new Error(`Failed to export notebook: ${res.statusText}`);
  return res.blob();
}

export async function importNotebook(zipFile) {
  const form = new FormData();
  form.append('file', zipFile);
  const res = await fetch('/api/notebooks/import', { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Failed to import notebook: ${res.statusText}`);
  return res.json();
}
