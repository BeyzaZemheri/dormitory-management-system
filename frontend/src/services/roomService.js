import axios from "axios";

const API_URL = "http://localhost:8080/api/rooms";

function authHeaders() {
  return {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };
}

export async function getRooms() {
  const response = await axios.get(API_URL, authHeaders());
  return response.data;
}

export async function addRoom(room) {
  const response = await axios.post(API_URL, room, authHeaders());
  return response.data;
}

export async function updateRoom(id, room) {
  const response = await axios.put(
    `${API_URL}/${id}`,
    room,
    authHeaders()
  );
  return response.data;
}

export async function deleteRoom(id) {
  await axios.delete(`${API_URL}/${id}`, authHeaders());
}