import axios from "axios";

const API_URL = "http://localhost:8080/api/assignments";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getActiveAssignments = async () => {
  const response = await axios.get(API_URL, getAuthConfig());
  return response.data;
};

export const assignStudent = async (studentId, roomId) => {
  const response = await axios.post(
    API_URL,
    { studentId, roomId },
    getAuthConfig()
  );
  return response.data;
};

export const transferStudent = async (studentId, roomId) => {
  const response = await axios.put(
    `${API_URL}/transfer`,
    { studentId, roomId },
    getAuthConfig()
  );
  return response.data;
};

export const releaseStudent = async (studentId) => {
  const response = await axios.put(
    `${API_URL}/release/${studentId}`,
    {},
    getAuthConfig()
  );
  return response.data;
};

export const getStudentAssignmentHistory = async (studentId) => {
  const response = await axios.get(
    `${API_URL}/history/${studentId}`,
    getAuthConfig()
  );
  return response.data;
};