import { API_BASE_URL } from './config';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiFetchOptions extends Omit<RequestInit, 'headers' | 'body'> {
  token?: string;
  headers?: Record<string, string>;
  body?: BodyInit | null;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, headers: extraHeaders, body, ...rest } = options;

  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = isFormData
    ? { ...extraHeaders }
    : { 'Content-Type': 'application/json', ...extraHeaders };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    body: body as BodyInit,
    headers,
  });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // keep statusText
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export async function uploadProductImage(
  file: File,
  token: string,
): Promise<{ url: string }> {
  return uploadFile('/products/upload-image', file, token);
}

export async function uploadPurchaseOrderSlip(
  file: File,
  token: string,
): Promise<{ url: string }> {
  return uploadFile('/purchase-orders/upload-slip', file, token);
}

async function uploadFile(
  path: string,
  file: File,
  token: string,
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch { /* ignore */ }
    throw new ApiError(res.status, message);
  }

  return res.json();
}
