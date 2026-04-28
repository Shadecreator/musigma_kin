const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const AUTH_TOKEN_STORAGE_KEY = "kin_auth_token";

async function parseJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(text || "Unexpected response from server.");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail || data?.message || "Request failed.");
  }
  return data;
}

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

function withAuthHeaders(headers = {}) {
  const token = getAuthToken();
  if (!token) return headers;
  return {
    ...headers,
    Authorization: `Bearer ${token}`
  };
}

export async function signupUser(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse(response);
}

export async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse(response);
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: withAuthHeaders()
  });
  return parseJsonResponse(response);
}

export function persistAuthToken(token) {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export async function createSession() {
  const response = await fetch(`${API_BASE_URL}/session`, {
    method: "POST",
    headers: withAuthHeaders()
  });
  return parseJsonResponse(response);
}

export async function ingestDocuments(sessionId, files) {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  files.forEach((file) => formData.append("files", file));

  const response = await fetch(`${API_BASE_URL}/ingest`, {
    method: "POST",
    headers: withAuthHeaders(),
    body: formData
  });

  return parseJsonResponse(response);
}

export async function getSessionDocuments(sessionId) {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}`, {
    method: "GET",
    headers: withAuthHeaders()
  });

  return parseJsonResponse(response);
}

export async function chatDoctor(sessionId, question) {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}/chat`, {
    method: "POST",
    headers: withAuthHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({ question })
  });

  return parseJsonResponse(response);
}

export async function analyzeSession(sessionId) {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}/analyze`, {
    method: "POST",
    headers: withAuthHeaders()
  });

  return parseJsonResponse(response);
}

export async function getAnalysis(sessionId) {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}/analysis`, {
    method: "GET",
    headers: withAuthHeaders()
  });

  return parseJsonResponse(response);
}

export async function seedDemoData(sessionId) {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}/seed-demo`, {
    method: "POST",
    headers: withAuthHeaders()
  });

  return parseJsonResponse(response);
}

export { API_BASE_URL };
