import axios from "axios";

const API_URL = "http://localhost:8080/api/users/me";

export async function getMyProfile() {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.data;
}
export async function getMyRoom() {
  const response = await axios.get(
    "http://localhost:8080/api/assignments/me",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return response.status === 204 ? null : response.data;
}