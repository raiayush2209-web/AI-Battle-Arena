const BASE_URL = "http://localhost:3000";

export async function registerApi(userData) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
}

export async function loginApi(credentials) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }
  return data;
}

export async function getMeApi() {
  const res = await fetch(`${BASE_URL}/api/auth/get-me`, {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch user");
  }
  return data;
}

export async function logoutApi() {
  const res = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Logout failed");
  }
  return data;
}

export async function invokeBattleApi(question) {
  const res = await fetch(`${BASE_URL}/invoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ input: question }),
  });
  const data = await res.json();
  return data;
}

// Conversation APIs
export async function getConversationsApi() {
  const res = await fetch(`${BASE_URL}/api/conversations`, {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch conversations");
  }
  return data;
}

export async function getConversationApi(id) {
  const res = await fetch(`${BASE_URL}/api/conversations/${id}`, {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch conversation");
  }
  return data;
}

export async function createConversationApi(title) {
  const res = await fetch(`${BASE_URL}/api/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(title ? { title } : {}),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to create conversation");
  }
  return data;
}

export async function updateConversationApi(id, updates) {
  const res = await fetch(`${BASE_URL}/api/conversations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to update conversation");
  }
  return data;
}

export async function deleteConversationApi(id) {
  const res = await fetch(`${BASE_URL}/api/conversations/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to delete conversation");
  }
  return data;
}

export async function addBattleMessageApi(id, { userMessage, assistant }) {
  const res = await fetch(`${BASE_URL}/api/conversations/${id}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ userMessage, assistant }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to save message to conversation");
  }
  return data;
}
