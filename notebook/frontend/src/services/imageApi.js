export async function uploadImage(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/images/upload', { method: 'POST', body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Image upload failed: ${res.statusText}`);
  }
  return res.json(); // { fileName }
}

export async function deleteImage(fileName) {
  await fetch(`/api/images/${encodeURIComponent(fileName)}`, { method: 'DELETE' });
}

export function getImageUrl(fileName) {
  return `/api/images/${encodeURIComponent(fileName)}`;
}
