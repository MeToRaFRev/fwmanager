// services/api.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const login = async (username, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message || "Invalid credentials");
  }
  const data = await response.json();
  return data; // returns { token }
};

const verify = async (token) => {
  const response = await fetch(`${API_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    throw new Error("Invalid token");
  }
  return await response.json(); // returns { username, role }
};

const getRequests = async (token) => {
  const response = await fetch(`${API_URL}/requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch requests");
  }
  return await response.json();
};

const getRequestById = async (id, token) => {
  const response = await fetch(`${API_URL}/request/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch request");
  }
  return await response.json();
};

const createRequest = async (data, token) => {
  const response = await fetch(`${API_URL}/requests`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if(response.status === 409) {
      const { duplicateRequestId } = await response.json();
      throw new Error(`Duplicate request detected.\n Request ID: ${duplicateRequestId}`);
    }
    throw new Error("Failed to create request");
  }
  return await response.json();
};
const updateRequest = async (id, data, token) => {
  const response = await fetch(`${API_URL}/request/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update request");
  }
  return await response.json();
};


const getAuditLog = async (token) => {
  const response = await fetch(`${API_URL}/audit`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch audit log");
  }
  return await response.json();
};

const nslookup = async (domain) => {
  const response = await fetch(`${API_URL}/nslookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain }),
  });
  if (!response.ok) {
    throw new Error("NSLookup failed");
  }
  return await response.json();
};

const installRules = async (requests, token) => {
  const response = await fetch(`${API_URL}/install`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(requests),
  });
  if (!response.ok) {
    throw new Error("Failed to install rules");
  }
  return await response.json();
}

const api = {
  login,
  verify,
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  getAuditLog,
  nslookup,
  installRules
}
export default api
