import { useEffect, useState } from "react";
import {
  getRooms,
  addRoom,
  updateRoom,
  deleteRoom,
} from "../services/roomService";
import "./RoomPage.css";

const emptyForm = {
  roomNumber: "",
  capacity: "",
  status: "AVAILABLE",
};

function RoomPage() {
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  async function loadRooms() {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load rooms.");
      setMessageType("error");
    } finally {
      setPageLoading(false);
    }
  }

  useEffect(() => {
    loadRooms();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  }

  function handleAdd() {
    if (showForm) {
      resetForm();
    } else {
      setEditingId(null);
      setForm({ ...emptyForm });
      setErrors({});
      setMessage("");
      setShowForm(true);
    }
  }

  function handleEdit(room) {
    setEditingId(room.id);

    setForm({
      roomNumber: room.roomNumber || "",
      capacity: String(room.capacity ?? ""),
      status:
        room.status === "MAINTENANCE"
          ? "MAINTENANCE"
          : "AVAILABLE",
    });

    setErrors({});
    setMessage("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrors({});
    setMessage("");

    const roomData = {
      roomNumber: form.roomNumber.trim(),
      capacity: Number(form.capacity),
      status: editingId === null ? "AVAILABLE" : form.status,
    };

    const newErrors = {};

    if (!roomData.roomNumber) {
      newErrors.roomNumber = "Room number is required.";
    } else if (roomData.roomNumber.length > 30) {
      newErrors.roomNumber =
        "Room number cannot exceed 30 characters.";
    }

    if (
      form.capacity === "" ||
      !Number.isInteger(roomData.capacity) ||
      roomData.capacity < 1
    ) {
      newErrors.capacity =
        "Capacity must be a positive whole number.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage("Please correct the highlighted fields.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      if (editingId !== null) {
        await updateRoom(editingId, roomData);
        setMessage("Room updated successfully.");
      } else {
        await addRoom(roomData);
        setMessage("Room added successfully.");
      }

      setMessageType("success");
      resetForm();
      await loadRooms();
    } catch (error) {
      console.error(error);

      const response = error.response?.data;

      if (response?.errors) {
        setErrors(response.errors);
        setMessage("Please correct the highlighted fields.");
      } else {
        setMessage(response?.message || "Room operation failed.");
      }

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (
      !window.confirm(
        "Are you sure you want to delete this room?"
      )
    ) {
      return;
    }

    try {
      await deleteRoom(id);

      setMessage("Room deleted successfully.");
      setMessageType("success");

      await loadRooms();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to delete room."
      );
      setMessageType("error");
    }
  }

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = String(room.roomNumber)
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || room.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalRooms = rooms.length;

  const availableRooms = rooms.filter(
    (room) => room.status === "AVAILABLE"
  ).length;

  const fullRooms = rooms.filter(
    (room) => room.status === "FULL"
  ).length;

  const maintenanceRooms = rooms.filter(
    (room) => room.status === "MAINTENANCE"
  ).length;

  function getStatusClass(status) {
    switch (status) {
      case "AVAILABLE":
        return "available";
      case "FULL":
        return "full";
      case "MAINTENANCE":
        return "maintenance";
      default:
        return "";
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case "AVAILABLE":
        return "Available";
      case "FULL":
        return "Full";
      case "MAINTENANCE":
        return "Maintenance";
      default:
        return status;
    }
  }

  return (
    <main className="room-page">
      <div className="room-page-header">
        <div>
          <span className="room-eyebrow">
            DORMITORY MANAGEMENT
          </span>

          <h1>Room Management</h1>

          <p>
            Manage dormitory rooms, capacity, and availability.
          </p>
        </div>

        <button
          type="button"
          className="room-primary-btn"
          onClick={handleAdd}
        >
          {showForm ? "✕ Cancel" : "+ Add Room"}
        </button>
      </div>

      {/* STATISTICS */}

      <div className="room-stats">
        <div className="room-stat-card">
          <span>Total Rooms</span>
          <strong>{totalRooms}</strong>
          <small>Registered dormitory rooms</small>
        </div>

        <div className="room-stat-card">
          <span>Available Rooms</span>
          <strong>{availableRooms}</strong>
          <small>Rooms accepting assignments</small>
        </div>

        <div className="room-stat-card">
          <span>Full Rooms</span>
          <strong>{fullRooms}</strong>
          <small>Rooms at full capacity</small>
        </div>

        <div className="room-stat-card">
          <span>Maintenance</span>
          <strong>{maintenanceRooms}</strong>
          <small>Rooms temporarily unavailable</small>
        </div>
      </div>

      {/* MESSAGES */}

      {message && (
        <div
          className={`room-message ${messageType}`}
          role="status"
        >
          {message}
        </div>
      )}

      {/* ADD / EDIT FORM */}

      {showForm && (
        <section className="room-form-card">
          <div className="room-section-heading">
            <div>
              <h2>
                {editingId !== null
                  ? "Edit Room"
                  : "Add New Room"}
              </h2>

              <p>
                {editingId !== null
                  ? "Update room information and availability."
                  : "Register a new dormitory room."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="room-form-grid">
              <div className="room-field">
                <label htmlFor="roomNumber">
                  Room Number
                </label>

                <input
                  id="roomNumber"
                  name="roomNumber"
                  type="text"
                  placeholder="e.g. A-101"
                  value={form.roomNumber}
                  onChange={handleChange}
                  maxLength={30}
                  required
                  aria-invalid={Boolean(errors.roomNumber)}
                  className={
                    errors.roomNumber ? "input-error" : ""
                  }
                />

                {errors.roomNumber && (
                  <small className="room-field-error">
                    {errors.roomNumber}
                  </small>
                )}
              </div>

              <div className="room-field">
                <label htmlFor="capacity">
                  Room Capacity
                </label>

                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 4"
                  value={form.capacity}
                  onChange={handleChange}
                  required
                  aria-invalid={Boolean(errors.capacity)}
                  className={
                    errors.capacity ? "input-error" : ""
                  }
                />

                {errors.capacity && (
                  <small className="room-field-error">
                    {errors.capacity}
                  </small>
                )}
              </div>

              {editingId !== null && (
                <div className="room-field">
                  <label htmlFor="status">
                    Room Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="AVAILABLE">
                      Available
                    </option>

                    <option value="MAINTENANCE">
                      Maintenance
                    </option>
                  </select>

                  <small className="room-field-hint">
                    Full status is calculated automatically
                    based on occupancy.
                  </small>
                </div>
              )}
            </div>

            <div className="room-form-actions">
              <button
                type="button"
                className="room-secondary-btn"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="room-primary-btn"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingId !== null
                    ? "Save Changes"
                    : "Create Room"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ROOM TABLE */}

      <section className="room-table-card">
        <div className="room-section-heading">
          <div>
            <h2>Room Directory</h2>
            <p>Search and manage dormitory rooms.</p>
          </div>

          <span className="room-count">
            {filteredRooms.length} rooms
          </span>
        </div>

        <div className="room-toolbar">
          <input
            type="search"
            placeholder="Search by room number..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search rooms"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            aria-label="Filter rooms by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="FULL">Full</option>
            <option value="MAINTENANCE">
              Maintenance
            </option>
          </select>
        </div>

        <div className="room-table-scroll">
          <table className="room-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {pageLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="room-empty"
                  >
                    Loading rooms...
                  </td>
                </tr>
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="room-empty"
                  >
                    No rooms found.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr key={room.id}>
                    <td>
                      <div className="room-name-cell">
                        <span className="room-icon">
                          ▣
                        </span>

                        <div>
                          <strong>
                            {room.roomNumber}
                          </strong>

                          <small>
                            Room ID #{room.id}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="room-capacity">
                        {room.capacity} beds
                      </span>
                    </td>

                    <td>
                      <span
                        className={`room-status-badge ${getStatusClass(
                          room.status
                        )}`}
                      >
                        <span className="room-status-dot" />

                        {getStatusLabel(room.status)}
                      </span>
                    </td>

                    <td>
                      {room.createdAt
                        ? new Date(
                            room.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      <div className="room-actions">
                        <button
                          type="button"
                          className="room-edit-btn"
                          onClick={() =>
                            handleEdit(room)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="room-delete-btn"
                          onClick={() =>
                            handleDelete(room.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default RoomPage;