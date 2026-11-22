import { useEffect, useState } from "react";
import {
  getActiveAssignments,
  assignStudent,
  transferStudent,
  releaseStudent,
  getStudentAssignmentHistory,
} from "../services/assignmentService";
import { getStudents } from "../services/userService";
import { getRooms } from "../services/roomService";
import "./AssignmentPage.css";

function AssignmentPage() {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [roomId, setRoomId] = useState("");

  const [transferStudentId, setTransferStudentId] = useState(null);
  const [transferRoomId, setTransferRoomId] = useState("");

  const [historyStudentId, setHistoryStudentId] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [assignmentData, studentData, roomData] = await Promise.all([
        getActiveAssignments(),
        getStudents(),
        getRooms(),
      ]);

      setAssignments(assignmentData);
      setStudents(studentData);
      setRooms(roomData);
      return true;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load data.");
      return false;
    } finally {
      setPageLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function clearNotifications() {
    setMessage("");
    setError("");
  }

  function availableRooms(excludedRoomId = null) {
    return rooms.filter(
      (room) =>
        room.status === "AVAILABLE" &&
        room.id !== excludedRoomId
    );
  }

  const assignedStudentIds = new Set(
    assignments.map((assignment) => assignment.studentId)
  );

  const eligibleStudents = students.filter(
    (student) =>
      (student.active ?? student.isActive) === true &&
      !assignedStudentIds.has(student.id)
  );

  const filteredAssignments = assignments.filter((assignment) => {
    const text = [
      assignment.studentName,
      assignment.studentEmail,
      assignment.roomNumber,
    ]
      .join(" ")
      .toLowerCase();

    return text.includes(search.trim().toLowerCase());
  });

  const availableRoomCount = availableRooms().length;
  const assignedStudentCount = assignments.length;
  const unassignedStudentCount = eligibleStudents.length;

  async function handleAssign(event) {
    event.preventDefault();

    if (!studentId || !roomId) return;

    clearNotifications();
    setLoading(true);

    try {
      await assignStudent(Number(studentId), Number(roomId));

      setMessage("Student assigned successfully.");
      setStudentId("");
      setRoomId("");

      await loadData();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to assign student."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleTransfer(event) {
    event.preventDefault();

    if (!transferStudentId || !transferRoomId) return;

    clearNotifications();
    setLoading(true);

    try {
      await transferStudent(
        transferStudentId,
        Number(transferRoomId)
      );

      setMessage("Student transferred successfully.");
      setTransferStudentId(null);
      setTransferRoomId("");

      await loadData();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to transfer student."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRelease(id) {
    if (
      !window.confirm(
        "Are you sure you want to release this student from their room?"
      )
    ) {
      return;
    }

    clearNotifications();
    setLoading(true);

    try {
      await releaseStudent(id);

      setMessage("Student released successfully.");

      if (transferStudentId === id) {
        setTransferStudentId(null);
        setTransferRoomId("");
      }

      await loadData();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to release student."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleHistory(event) {
    event.preventDefault();

    if (!historyStudentId) return;

    clearNotifications();
    setHistory([]);
    setHistoryLoaded(false);
    setHistoryLoading(true);

    try {
      const data = await getStudentAssignmentHistory(
        Number(historyStudentId)
      );

      setHistory(data);
      setHistoryLoaded(true);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to load assignment history."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  function formatDate(date) {
    return date ? new Date(date).toLocaleString() : "—";
  }

  function openTransfer(assignment) {
    clearNotifications();
    setTransferStudentId(assignment.studentId);
    setTransferRoomId("");
  }

  const selectedAssignment = assignments.find(
    (assignment) => assignment.studentId === transferStudentId
  );

  return (
    <main className="assignment-page">
      <div className="assignment-header">
        <span className="assignment-eyebrow">
          DORMITORY MANAGEMENT
        </span>

        <h1>Room Assignments</h1>

        <p>
          Manage student accommodation, transfers, and room history.
        </p>
      </div>

      <div className="assignment-stats">
        <div className="assignment-stat-card">
          <span>Active Assignments</span>
          <strong>{assignedStudentCount}</strong>
          <small>Students currently assigned to rooms</small>
        </div>

        <div className="assignment-stat-card">
          <span>Available Rooms</span>
          <strong>{availableRoomCount}</strong>
          <small>Rooms accepting new assignments</small>
        </div>

        <div className="assignment-stat-card">
          <span>Unassigned Students</span>
          <strong>{unassignedStudentCount}</strong>
          <small>Active students without a room</small>
        </div>
      </div>

      {message && (
        <div className="assignment-alert success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="assignment-alert error" role="alert">
          {error}
        </div>
      )}

      <section className="assignment-card">
        <div className="assignment-section-heading">
          <h2>Assign Student to Room</h2>
          <p>Select an eligible student and an available room.</p>
        </div>

        <form className="assignment-form" onSubmit={handleAssign}>
          <div className="assignment-field">
            <label htmlFor="student-select">Student</label>

            <select
              id="student-select"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select student</option>

              {eligibleStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                  {" — "}
                  {student.email}
                </option>
              ))}
            </select>
          </div>

          <div className="assignment-field">
            <label htmlFor="room-select">Room</label>

            <select
              id="room-select"
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select room</option>

              {availableRooms().map((room) => (
                <option key={room.id} value={room.id}>
                  Room {room.roomNumber}
                  {" — "}
                  Capacity: {room.capacity}
                </option>
              ))}
            </select>
          </div>

          <button
            className="assignment-button primary"
            type="submit"
            disabled={loading || !studentId || !roomId}
          >
            {loading ? "Processing..." : "+ Assign Student"}
          </button>
        </form>
      </section>

      <section className="assignment-card">
        <div className="assignment-section-heading assignment-heading-row">
          <div>
            <h2>Active Assignments</h2>
            <p>Students currently assigned to dormitory rooms.</p>
          </div>

          <span className="assignment-count">
            {filteredAssignments.length}{" "}
            {filteredAssignments.length === 1
              ? "assignment"
              : "assignments"}
          </span>
        </div>

        <div className="assignment-toolbar">
          <input
            type="search"
            placeholder="Search by student, email, or room..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search active assignments"
          />
        </div>

        <div className="assignment-table-wrapper">
          <table className="assignment-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Room</th>
                <th>Assigned At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {pageLoading ? (
                <tr>
                  <td colSpan="5" className="assignment-empty">
                    Loading assignments...
                  </td>
                </tr>
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="assignment-empty">
                    No active assignments found.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>
                      <div className="assignment-student-cell">
                        <span className="assignment-avatar">
                          {assignment.studentName
                            ?.split(" ")
                            .slice(0, 2)
                            .map((part) => part.charAt(0).toUpperCase())
                            .join("")}
                        </span>

                        <div>
                          <strong>{assignment.studentName}</strong>
                          <small>Student ID #{assignment.studentId}</small>
                        </div>
                      </div>
                    </td>

                    <td>{assignment.studentEmail}</td>

                    <td>
                      <span className="assignment-room-badge">
                        Room {assignment.roomNumber}
                      </span>
                    </td>

                    <td>{formatDate(assignment.assignedAt)}</td>

                    <td>
                      <div className="assignment-actions">
                        <button
                          type="button"
                          className="assignment-button secondary"
                          disabled={loading}
                          onClick={() => openTransfer(assignment)}
                        >
                          Transfer
                        </button>

                        <button
                          type="button"
                          className="assignment-button danger"
                          disabled={loading}
                          onClick={() =>
                            handleRelease(assignment.studentId)
                          }
                        >
                          Release
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

      {selectedAssignment && (
        <section className="assignment-card transfer-card">
          <div className="assignment-section-heading">
            <h2>Transfer Student</h2>
            <p>
              Transfer <strong>{selectedAssignment.studentName}</strong>{" "}
              from Room {selectedAssignment.roomNumber}.
            </p>
          </div>

          <form className="assignment-form" onSubmit={handleTransfer}>
            <div className="assignment-field">
              <label htmlFor="transfer-room">New Room</label>

              <select
                id="transfer-room"
                value={transferRoomId}
                onChange={(event) =>
                  setTransferRoomId(event.target.value)
                }
                required
                disabled={loading}
              >
                <option value="">Select new room</option>

                {availableRooms(selectedAssignment.roomId).map(
                  (room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber}
                      {" — "}
                      Capacity: {room.capacity}
                    </option>
                  )
                )}
              </select>
            </div>

            <button
              className="assignment-button primary"
              type="submit"
              disabled={loading || !transferRoomId}
            >
              {loading ? "Processing..." : "Confirm Transfer"}
            </button>

            <button
              className="assignment-button secondary"
              type="button"
              disabled={loading}
              onClick={() => {
                setTransferStudentId(null);
                setTransferRoomId("");
              }}
            >
              Cancel
            </button>
          </form>
        </section>
      )}

      <section className="assignment-card">
        <div className="assignment-section-heading">
          <h2>Student Assignment History</h2>
          <p>View previous and current room assignments.</p>
        </div>

        <form className="assignment-form" onSubmit={handleHistory}>
          <div className="assignment-field">
            <label htmlFor="history-student">Student</label>

            <select
              id="history-student"
              value={historyStudentId}
              onChange={(event) => {
                setHistoryStudentId(event.target.value);
                setHistory([]);
                setHistoryLoaded(false);
              }}
              required
            >
              <option value="">Select student</option>

              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </div>

          <button
            className="assignment-button primary"
            type="submit"
            disabled={!historyStudentId || historyLoading}
          >
            {historyLoading ? "Loading..." : "View History"}
          </button>
        </form>

        {historyLoaded && (
          <div className="assignment-table-wrapper history-table">
            <table className="assignment-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Assigned At</th>
                  <th>Released At</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="assignment-empty">
                      No assignment history found.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="assignment-room-badge">
                          Room {item.roomNumber}
                        </span>
                      </td>

                      <td>{formatDate(item.assignedAt)}</td>
                      <td>{formatDate(item.releasedAt)}</td>

                      <td>
                        <span
                          className={`assignment-status ${
                            item.active ? "active" : "released"
                          }`}
                        >
                          {item.active ? "Active" : "Released"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AssignmentPage;