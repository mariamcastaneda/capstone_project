export async function getElements(pageId) {
  const res = await fetch(`/api/pages/${pageId}/elements`);
  if (!res.ok) throw new Error(`Failed to fetch elements: ${res.statusText}`);
  return res.json();
}

export async function createElement(pageId, payload) {
  const res = await fetch(`/api/pages/${pageId}/elements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create element: ${res.statusText}`);
  return res.json();
}

export async function updateElement(id, patch) {
  const res = await fetch(`/api/elements/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Failed to update element: ${res.statusText}`);
  return res.json();
}

export async function deleteElement(id) {
  const res = await fetch(`/api/elements/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) throw new Error(`Failed to delete element: ${res.statusText}`);
}

export async function deleteAllElements(pageId) {
  const res = await fetch(`/api/pages/${pageId}/elements`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to clear elements: ${res.statusText}`);
}
