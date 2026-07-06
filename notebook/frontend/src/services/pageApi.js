export async function getPages(notebookId) {
  const res = await fetch(`/api/notebooks/${notebookId}/pages`);
  if (!res.ok) throw new Error(`Failed to fetch pages: ${res.statusText}`);
  return res.json();
}

export async function createPage(notebookId, name = 'New Page') {
  const res = await fetch(`/api/notebooks/${notebookId}/pages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Failed to create page: ${res.statusText}`);
  return res.json();
}

export async function updatePage(id, patch) {
  const res = await fetch(`/api/pages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Failed to update page: ${res.statusText}`);
  return res.json();
}

export async function deletePage(id) {
  const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) throw new Error(`Failed to delete page: ${res.statusText}`);
}
