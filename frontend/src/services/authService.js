import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export async function login(email, password) {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });

  return response.data;
}

export async function register(student) {
  const response = await axios.post(`${API_URL}/register`, student);
  return response.data;
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getRole() {
  const token = getToken();

  if (!token) return null;

  try {
    const payload = JSON.parse(
      atob(
        token.split(".")[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      logout();
      return null;
    }

    return payload.role || null;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
}