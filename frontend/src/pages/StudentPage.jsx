import { useEffect, useState } from "react";
import {
  getStudents,
  addStudent,
  updateStudent,
  deactivateStudent,
} from "../services/userService";
import "./StudentPage.css";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phoneNumber: "",
  birthDate: "",
  identityNumber: "",
};

function StudentPage() {
  const [students, setStudents] = useState([]);
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

  async function loadStudents() {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load students.");
      setMessageType("error");
    } finally {
      setPageLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  }

  function handleEdit(student) {
    setEditingId(student.id);

    setForm({
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      email: student.email || "",
      password: "",
      phoneNumber: student.phoneNumber || "",
      birthDate: "",
      identityNumber: "",
    });

    setErrors({});
    setMessage("");
    setShowForm(true);
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

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setErrors({});
    setMessage("");

    try {
      if (editingId !== null) {
        await updateStudent(editingId, {
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNumber: form.phoneNumber,
        });

        setMessage("Student updated successfully.");
      } else {
        await addStudent({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          phoneNumber: form.phoneNumber,
          birthDate: form.birthDate,
          identityNumber: form.identityNumber,
        });

        setMessage("Student added successfully.");
      }

      setMessageType("success");
      resetForm();
      await loadStudents();
    } catch (error) {
      console.error(error);

      const response = error.response?.data;

      if (response?.errors) {
        setErrors(response.errors);
        setMessage("Please correct the highlighted fields.");
      } else {
        setMessage(response?.message || "Operation failed.");
      }

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeactivate(id) {
    if (!window.confirm("Are you sure you want to deactivate this student?")) {
      return;
    }

    try {
      await deactivateStudent(id);

      setMessage("Student deactivated successfully.");
      setMessageType("success");

      await loadStudents();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to deactivate student.");
      setMessageType("error");
    }
  }

  const filteredStudents = students.filter((student) => {
    const text =
      `${student.firstName} ${student.lastName} ${student.email}`.toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && student.active) ||
      (statusFilter === "INACTIVE" && !student.active);

    return matchesSearch && matchesStatus;
  });

  const totalStudents = students.length;
  const activeStudents = students.filter((student) => student.active).length;
  const inactiveStudents = totalStudents - activeStudents;

  function renderField(name, label, options = {}) {
    const {
      type = "text",
      placeholder = "",
      required = true,
      minLength,
      maxLength,
      autoComplete,
    } = options;

    return (
      <div className="student-field" key={name}>
        <label htmlFor={`student-${name}`}>{label}</label>

        <input
          id={`student-${name}`}
          name={name}
          type={type}
          placeholder={placeholder}
          value={form[name]}
          onChange={handleChange}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          autoComplete={autoComplete}
          aria-invalid={Boolean(errors[name])}
          className={errors[name] ? "input-error" : ""}
        />

        {errors[name] && (
          <small className="student-field-error">{errors[name]}</small>
        )}
      </div>
    );
  }

  return (
    <main className="student-page">
      <div className="student-page-header">
        <div>
          <span className="student-eyebrow">DORMITORY MANAGEMENT</span>
          <h1>Student Management</h1>
          <p>Manage student records, accounts, and enrollment status.</p>
        </div>

        <button
          type="button"
          className="student-primary-btn"
          onClick={handleAdd}
        >
          {showForm ? "✕ Cancel" : "+ Add Student"}
        </button>
      </div>

      <div className="student-stats">
        <div className="student-stat-card">
          <span>Total Students</span>
          <strong>{totalStudents}</strong>
          <small>Registered student accounts</small>
        </div>

        <div className="student-stat-card">
          <span>Active Students</span>
          <strong>{activeStudents}</strong>
          <small>Currently active accounts</small>
        </div>

        <div className="student-stat-card">
          <span>Inactive Students</span>
          <strong>{inactiveStudents}</strong>
          <small>Deactivated accounts</small>
        </div>
      </div>

      {message && (
        <div
          className={`student-message ${messageType}`}
          role="status"
        >
          {message}
        </div>
      )}

      {showForm && (
        <section className="student-form-card">
          <div className="student-section-heading">
            <div>
              <h2>
                {editingId !== null ? "Edit Student" : "Add New Student"}
              </h2>
              <p>
                {editingId !== null
                  ? "Update the student's basic information."
                  : "Create a new student account."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="student-form-grid">
              {renderField("firstName", "First Name", {
                placeholder: "Enter first name",
              })}

              {renderField("lastName", "Last Name", {
                placeholder: "Enter last name",
              })}

              {editingId === null && (
                <>
                  {renderField("email", "Email Address", {
                    type: "email",
                    placeholder: "student@example.com",
                    autoComplete: "email",
                  })}

                  {renderField("password", "Password", {
                    type: "password",
                    placeholder: "Minimum 8 characters",
                    minLength: 8,
                    autoComplete: "new-password",
                  })}
                </>
              )}

              {renderField("phoneNumber", "Phone Number", {
                type: "tel",
                placeholder: "Enter phone number",
                autoComplete: "tel",
              })}

              {editingId === null && (
                <>
                  {renderField("birthDate", "Birth Date", {
                    type: "date",
                  })}

                  {renderField("identityNumber", "Identity Number", {
                    placeholder: "11-digit test identity number",
                    maxLength: 11,
                  })}
                </>
              )}
            </div>

            <div className="student-form-actions">
              <button
                type="button"
                className="student-secondary-btn"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="student-primary-btn"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingId !== null
                    ? "Save Changes"
                    : "Create Student"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="student-table-card">
        <div className="student-section-heading">
          <div>
            <h2>Student Directory</h2>
            <p>Search and manage registered students.</p>
          </div>

          <span className="student-count">
            {filteredStudents.length} students
          </span>
        </div>

        <div className="student-toolbar">
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search students"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by student status"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="student-table-scroll">
          <table className="student-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {pageLoading ? (
                <tr>
                  <td colSpan="6" className="student-empty">
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="student-empty">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-name-cell">
                        <span className="student-avatar">
                          {student.firstName?.charAt(0)?.toUpperCase()}
                          {student.lastName?.charAt(0)?.toUpperCase()}
                        </span>

                        <div>
                          <strong>
                            {student.firstName} {student.lastName}
                          </strong>
                          <small>ID #{student.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>{student.email}</td>
                    <td>{student.phoneNumber || "—"}</td>
                    <td>
                      <span className="student-role-badge">
                        {student.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`student-status-badge ${
                          student.active ? "active" : "inactive"
                        }`}
                      >
                        <span className="student-status-dot" />
                        {student.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="student-actions">
                        <button
                          type="button"
                          className="student-edit-btn"
                          onClick={() => handleEdit(student)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="student-deactivate-btn"
                          onClick={() => handleDeactivate(student.id)}
                          disabled={!student.active}
                        >
                          Deactivate
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

export default StudentPage;