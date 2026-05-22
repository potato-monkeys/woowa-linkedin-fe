import { formatAuthorization } from './auth.js';
//import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
import.meta.env.VITE_API_BASE_URL || 'http://15.164.96.149';


const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://15.164.96.149');
//const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:8080');

async function request(endpoint, options = {}) {
  const token = window.localStorage.getItem('crewling-token');
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = formatAuthorization(token);
  }

  let body = options.body;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  // Normalize endpoint path (make sure it starts with / if it doesn't have http)
  const normalizedEndpoint = endpoint.startsWith('http')
    ? endpoint
    : endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL}${normalizedEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // fallback to status text
      if (response.statusText) {
        errorMessage = response.statusText;
      }
    }
    const err = new Error(errorMessage);
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export const client = {
  get: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: 'DELETE' }),
};
