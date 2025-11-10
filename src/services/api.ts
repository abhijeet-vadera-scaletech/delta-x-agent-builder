import type {
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  Agent,
  CreateAgentRequest,
  UpdateAgentRequest,
  AgentStats,
  AgentDetails,
} from "../types";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<LoginResponse>(response);
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<RegisterResponse>(response);
  },

  getCurrentUser: async (): Promise<User> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<User>(response);
  },
};

// Users API
export const usersAPI = {
  list: async (): Promise<User[]> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE_URL}/api/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<User[]>(response);
  },

  getById: async (id: string): Promise<User> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<User>(response);
  },
};

// Agents API
export const agentsAPI = {
  create: async (data: CreateAgentRequest): Promise<Agent> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE_URL}/api/agents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Agent>(response);
  },

  list: async (): Promise<Agent[]> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE_URL}/api/agents`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<Agent[]>(response);
  },

  getById: async (id: string): Promise<Agent> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<Agent>(response);
  },

  getDetails: async (id: string): Promise<AgentDetails> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE_URL}/api/agents/${id}/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<AgentDetails>(response);
  },

  update: async (id: string, data: UpdateAgentRequest): Promise<Agent> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Agent>(response);
  },

  getStats: async (): Promise<AgentStats> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE_URL}/api/agents/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<AgentStats>(response);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<{ message: string }>(response);
  },

  permanentDelete: async (id: string): Promise<{ message: string }> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE_URL}/api/agents/${id}/permanent`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<{ message: string }>(response);
  },
};

export { API_BASE_URL };
