export const API_BASE = import.meta.env.VITE_API_BASE || '/'
console.log(API_BASE, 'API_BASE')
export const j = async (path: string, method: string, body?: any, token?: string) => {
  const headers: any = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  // Only set JSON content-type if body is not FormData
  const isFormData = body instanceof FormData;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const g = async (path: string, token?: string) => j(path, 'GET', undefined, token);
