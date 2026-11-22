import axios from "axios";

const API_URL = "http://localhost:8080/api/users/students";

function authHeaders() {
  return {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };
}

export async function getStudents() {
  const response = await axios.get(API_URL, authHeaders());
  return response.data;
}

export async function addStudent(student) {
  const response = await axios.post(API_URL, student, authHeaders());
  return response.data;
}

export async function updateStudent(id, student) {
  const response = await axios.put(`${API_URL}/${id}`, student, authHeaders());
  return response.data;
}

export async function deactivateStudent(id) {
  await axios.patch(`${API_URL}/${id}/deactivate`, {}, authHeaders());
}