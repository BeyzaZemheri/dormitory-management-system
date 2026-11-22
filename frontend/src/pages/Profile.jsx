import { useEffect, useState } from "react";
import { getMyProfile, getMyRoom } from "../services/profileService";

import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const [userData, roomData] = await Promise.all([
          getMyProfile(),
          getMyRoom(),
        ]);

        setUser(userData);
        setRoom(roomData);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="profile-page">
        <p>Loading profile...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="profile-page">
        <p style={{ color: "#f87171" }}>{error}</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>View your personal information and room details.</p>
      </div>

      {/* PERSONAL INFORMATION */}
      <section className="profile-card">
        <div className="profile-avatar">
          {user.firstName?.charAt(0)}
          {user.lastName?.charAt(0)}
        </div>

        <h2>
          {user.firstName} {user.lastName}
        </h2>

        <p className="profile-role">{user.role}</p>

        <div className="profile-details">
          <div>
            <span>Student ID</span>
            <strong>{user.id}</strong>
          </div>

          <div>
            <span>Email Address</span>
            <strong>{user.email}</strong>
          </div>

          <div>
            <span>Phone Number</span>
            <strong>{user.phoneNumber || "Not provided"}</strong>
          </div>

          <div>
            <span>Account Status</span>
            <strong
              className={
                user.active ? "profile-active" : "profile-inactive"
              }
            >
              {user.active ? "Active" : "Inactive"}
            </strong>
          </div>
        </div>
      </section>

      {/* ROOM INFORMATION */}
      <section className="profile-card profile-room-card">
        <h2>My Room</h2>

        {room ? (
          <div className="profile-details">
            <div>
              <span>Room Number</span>
              <strong>{room.roomNumber}</strong>
            </div>

            <div>
              <span>Assignment Status</span>
              <strong className="profile-active">
                {room.active ? "Active" : "Inactive"}
              </strong>
            </div>

            <div>
              <span>Assignment Date</span>
              <strong>
                {room.assignedAt
                  ? new Date(room.assignedAt).toLocaleString("en-GB")
                  : "Not available"}
              </strong>
            </div>

            <div>
              <span>Room Assignment ID</span>
              <strong>{room.id}</strong>
            </div>
          </div>
        ) : (
          <div className="profile-no-room">
            <h3>No room assigned yet</h3>
            <p>
              Your room information will appear here once an
              administrator assigns you to a room.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export default Profile;