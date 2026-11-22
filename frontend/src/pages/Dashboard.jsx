import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getStudents } from "../services/userService";
import { getRooms } from "../services/roomService";
import { getActiveAssignments } from "../services/assignmentService";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [studentData, roomData, assignmentData] =
        await Promise.all([
          getStudents(),
          getRooms(),
          getActiveAssignments(),
        ]);

      setStudents(studentData);
      setRooms(roomData);
      setAssignments(assignmentData);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) =>
      (student.active ?? student.isActive) === true
  ).length;

  const totalRooms = rooms.length;

  const availableRooms = rooms.filter(
    (room) => room.status === "AVAILABLE"
  ).length;

  const fullRooms = rooms.filter(
    (room) => room.status === "FULL"
  ).length;

  const occupiedBeds = assignments.length;

  const totalBeds = rooms.reduce(
    (total, room) => total + Number(room.capacity || 0),
    0
  );

  const occupancyRate =
    totalBeds > 0
      ? ((occupiedBeds / totalBeds) * 100).toFixed(1)
      : "0.0";

  function getRoomOccupancy(roomId) {
    return assignments.filter(
      (assignment) => assignment.roomId === roomId
    ).length;
  }

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
    <main className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            DORMITORY MANAGEMENT
          </span>

          <h1>Admin Dashboard</h1>

          <p>
            Overview of students, rooms, and dormitory occupancy.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh"
          onClick={loadDashboard}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <div className="dashboard-error" role="alert">
          {error}
        </div>
      )}

      <section className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span>Total Students</span>
          <strong>{totalStudents}</strong>
          <small>Registered student accounts</small>
        </div>

        <div className="dashboard-stat-card">
          <span>Active Students</span>
          <strong>{activeStudents}</strong>
          <small>Currently active accounts</small>
        </div>

        <div className="dashboard-stat-card">
          <span>Total Rooms</span>
          <strong>{totalRooms}</strong>
          <small>Registered dormitory rooms</small>
        </div>

        <div className="dashboard-stat-card">
          <span>Available Rooms</span>
          <strong>{availableRooms}</strong>
          <small>Rooms accepting assignments</small>
        </div>

        <div className="dashboard-stat-card">
          <span>Occupied Beds</span>
          <strong>{occupiedBeds}</strong>
          <small>Currently assigned students</small>
        </div>

        <div className="dashboard-stat-card highlight">
          <span>Occupancy Rate</span>
          <strong>{occupancyRate}%</strong>
          <small>
            {occupiedBeds} / {totalBeds} beds occupied
          </small>
        </div>
      </section>

      <section className="dashboard-card">
        <div className="dashboard-section-header">
          <div>
            <h2>Room Occupancy</h2>
            <p>
              Live occupancy overview of each dormitory room.
            </p>
          </div>

          <span className="dashboard-section-badge">
            {fullRooms} full{" "}
            {fullRooms === 1 ? "room" : "rooms"}
          </span>
        </div>

        {loading ? (
          <p className="dashboard-empty">
            Loading room information...
          </p>
        ) : rooms.length === 0 ? (
          <p className="dashboard-empty">
            No rooms found.
          </p>
        ) : (
          <div className="dashboard-room-list">
            {rooms.map((room) => {
              const occupied = getRoomOccupancy(room.id);

              const percentage =
                room.capacity > 0
                  ? Math.min(
                      (occupied / room.capacity) * 100,
                      100
                    )
                  : 0;

              return (
                <div
                  className="dashboard-room-item"
                  key={room.id}
                >
                  <div className="dashboard-room-top">
                    <div className="dashboard-room-info">
                      <span className="dashboard-room-icon">
                        ▣
                      </span>

                      <div>
                        <strong>
                          Room {room.roomNumber}
                        </strong>

                        <span
                          className={`dashboard-status ${getStatusClass(
                            room.status
                          )}`}
                        >
                          {getStatusLabel(room.status)}
                        </span>
                      </div>
                    </div>

                    <span className="dashboard-bed-count">
                      {occupied} / {room.capacity} beds
                    </span>
                  </div>

                  <div className="dashboard-progress">
                    <div
                      className={`dashboard-progress-fill ${getStatusClass(
                        room.status
                      )}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="dashboard-card">
        <div className="dashboard-section-header">
          <div>
            <h2>Quick Actions</h2>
            <p>
              Access dormitory management features.
            </p>
          </div>
        </div>

        <div className="dashboard-actions">
          <button
            type="button"
            onClick={() => navigate("/students")}
          >
            <span className="dashboard-action-icon">♙</span>

            <span>
              <strong>Manage Students</strong>
              <small>Student records and accounts</small>
            </span>

            <span className="dashboard-action-arrow">→</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/rooms")}
          >
            <span className="dashboard-action-icon">▣</span>

            <span>
              <strong>Manage Rooms</strong>
              <small>Room capacity and availability</small>
            </span>

            <span className="dashboard-action-arrow">→</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/assignments")}
          >
            <span className="dashboard-action-icon">⇄</span>

            <span>
              <strong>Room Assignments</strong>
              <small>Assignments and transfers</small>
            </span>

            <span className="dashboard-action-arrow">→</span>
          </button>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;