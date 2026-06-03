// src/utils/api.ts

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiOptions extends RequestInit {
  body?: any;
}

export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = localStorage.getItem('subly_token');
  
  const headers = new Headers(options.headers || {});
  
  // Set default content type to JSON unless it's FormData (for uploading proof/receipt)
  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  // Convert body to JSON string if it's a plain object
  if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    // Return structured API validation or general error messages
    const errorMessage = data.message || data.error || (data.errors ? 'Validation Error' : `HTTP error! status: ${response.status}`);
    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}
