import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register, getRole } from "../services/authService";
import "./LoginCard.css";

const initialRegisterForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phoneNumber: "",
  birthDate: "",
  identityNumber: "",
};

function LoginCard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState(initialRegisterForm);

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  function switchTab(tab) {
    setActiveTab(tab);
    setErrors({});
    setMessage("");
    setShowPassword(false);
  }

  function handleLoginChange(event) {
    const { name, value } = event.target;

    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleRegisterChange(event) {
    const { name, value } = event.target;

    setRegisterForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");

    try {
      const result = await login(loginForm.email, loginForm.password);

      const token = typeof result === "string" ? result : result.token;

      if (!token) {
        throw new Error("Token not found");
      }

      localStorage.setItem("token", token);

      const role = getRole();

      if (role === "ADMIN") {
        navigate("/dashboard", { replace: true });
      } else if (role === "STUDENT") {
        navigate("/profile", { replace: true });
      } else {
        localStorage.removeItem("token");
        setMessage("Unable to determine user role.");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");

    try {
      await register(registerForm);

      setRegisterForm(initialRegisterForm);
      setLoginForm((prev) => ({
        ...prev,
        email: registerForm.email,
      }));

      switchTab("login");
      setMessage("Account created successfully! You can now sign in.");
    } catch (error) {
      const response = error.response?.data;

      if (response?.errors) {
        setErrors(response.errors);
      } else {
        setMessage(response?.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo">✦ DORMIFY</div>

          <div className="auth-brand-content">
            <span className="auth-badge">SMART DORMITORY MANAGEMENT</span>

            <h1>
              Your space.
              <br />
              Your community.
            </h1>

            <p>
              A smarter way to manage dormitory life.
              Simple, secure, and designed for students.
            </p>

            <div className="auth-features">
              <div>✦ Smart room management</div>
              <div>✦ Secure student accounts</div>
              <div>✦ Seamless dormitory experience</div>
            </div>
          </div>

          <div className="auth-brand-footer">
            © 2026 Dormify. All rights reserved.
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-form-heading">
              <h2>
                {activeTab === "login"
                  ? "Welcome back"
                  : "Create your account"}
              </h2>

              <p>
                {activeTab === "login"
                  ? "Sign in to access your dormitory dashboard."
                  : "Join Dormify and get started today."}
              </p>
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={activeTab === "login" ? "active" : ""}
                onClick={() => switchTab("login")}
              >
                Sign In
              </button>

              <button
                type="button"
                className={activeTab === "register" ? "active" : ""}
                onClick={() => switchTab("register")}
              >
                Register
              </button>
            </div>

            {message && (
              <div
                className={`auth-message ${
                  message.includes("successfully") ? "success" : "error"
                }`}
                role="status"
              >
                {message}
              </div>
            )}

            {activeTab === "login" ? (
              <form onSubmit={handleLogin} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="login-email">Email address</label>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="login-password">Password</label>

                  <div className="password-input">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="auth-form">
                <div className="auth-form-row">
                  <div className="auth-field">
                    <label htmlFor="firstName">First name</label>
                    <input
                      id="firstName"
                      name="firstName"
                      value={registerForm.firstName}
                      onChange={handleRegisterChange}
                      placeholder="First name"
                      required
                    />
                    {errors.firstName && (
                      <small className="field-error">{errors.firstName}</small>
                    )}
                  </div>

                  <div className="auth-field">
                    <label htmlFor="lastName">Last name</label>
                    <input
                      id="lastName"
                      name="lastName"
                      value={registerForm.lastName}
                      onChange={handleRegisterChange}
                      placeholder="Last name"
                      required
                    />
                    {errors.lastName && (
                      <small className="field-error">{errors.lastName}</small>
                    )}
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="register-email">Email address</label>
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                  {errors.email && (
                    <small className="field-error">{errors.email}</small>
                  )}
                </div>

                <div className="auth-field">
                  <label htmlFor="register-password">Password</label>

                  <div className="password-input">
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {errors.password && (
                    <small className="field-error">{errors.password}</small>
                  )}
                </div>

                <div className="auth-field">
                  <label htmlFor="phoneNumber">Phone number</label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    name="phoneNumber"
                    value={registerForm.phoneNumber}
                    onChange={handleRegisterChange}
                    placeholder="Phone number"
                    autoComplete="tel"
                    required
                  />
                  {errors.phoneNumber && (
                    <small className="field-error">{errors.phoneNumber}</small>
                  )}
                </div>

                <div className="auth-form-row">
                  <div className="auth-field">
                    <label htmlFor="birthDate">Birth date</label>
                    <input
                      id="birthDate"
                      type="date"
                      name="birthDate"
                      value={registerForm.birthDate}
                      onChange={handleRegisterChange}
                      required
                    />
                    {errors.birthDate && (
                      <small className="field-error">{errors.birthDate}</small>
                    )}
                  </div>

                  <div className="auth-field">
                    <label htmlFor="identityNumber">Identity number</label>
                    <input
                      id="identityNumber"
                      name="identityNumber"
                      value={registerForm.identityNumber}
                      onChange={handleRegisterChange}
                      placeholder="11 digits"
                      inputMode="numeric"
                      maxLength={11}
                      required
                    />
                    {errors.identityNumber && (
                      <small className="field-error">
                        {errors.identityNumber}
                      </small>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account →"}
                </button>
              </form>
            )}

            <p className="auth-bottom-text">
              {activeTab === "login"
                ? "New to Dormify?"
                : "Already have an account?"}

              <button
                type="button"
                onClick={() =>
                  switchTab(activeTab === "login" ? "register" : "login")
                }
              >
                {activeTab === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginCard;