const AUTH_PAYLOAD_SECRET = "POS_AUTH_SECRET_NONCE_HANDSHAKE_2026";

export function encryptLoginPayload(username: string, pin: string): string {
  const payloadObj = {
    username: username.trim(),
    pin: pin.trim(),
    ts: Math.floor(Date.now() / 1000),
    nonce: Math.random().toString(36).substring(2, 10),
  };

  const jsonStr = JSON.stringify(payloadObj);
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(jsonStr);
  const keyBytes = encoder.encode(AUTH_PAYLOAD_SECRET);

  const xored = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i++) {
    xored[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }

  let binary = "";
  for (let i = 0; i < xored.length; i++) {
    binary += String.fromCharCode(xored[i]);
  }
  return btoa(binary);
}

export function getAuthHeaders(): HeadersInit {
  let userName = "";
  try {
    const raw = localStorage.getItem("pos_auth_user") || localStorage.getItem("current_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      userName = parsed.name || parsed.username || "";
    }
  } catch (e) {}

  return {
    "Content-Type": "application/json",
    ...(userName ? { "X-User-Name": userName } : {}),
  };
}

export const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (init.body && !(init.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    ...init,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...init.headers,
    },
  };

  const response = await window.fetch(input, config);

  if (response.status === 401) {
    const isLoginEndpoint = typeof input === 'string' && input.includes('/auth/login');
    if (!isLoginEndpoint) {
      localStorage.removeItem('current_employee');
      localStorage.removeItem('current_role');
      window.dispatchEvent(new CustomEvent('pos:session-expired'));
    }
  }

  return response;
}
