import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { adminsAPI } from "../../api/dataAPI";

import "../../style/Admin/AdminCommon.css";
import logo from "../../assets/CaliYog-Logo.png";
import homeVideo from "../../assets/home-video.mp4";

// ─── Screens ───────────────────────────────────────────────────────────────
const SCREEN = {
  LOGIN: "login",
  FORGOT_EMAIL: "forgot_email",  // Step 1: verify registered email
  FORGOT_RESET: "forgot_reset",  // Step 2: enter new password
  FORGOT_DONE: "forgot_done",    // Step 3: success
};

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ── Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Forgot password state
  const [screen, setScreen] = useState(SCREEN.LOGIN);
  const [fpEmail, setFpEmail] = useState("");
  const [fpAdminRecord, setFpAdminRecord] = useState(null); // matched admin doc
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [showFpPassword, setShowFpPassword] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // LOGIN SUBMIT
  // ─────────────────────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const admins = await adminsAPI.getAll();
      const admin = admins.find(
        (a) => a.email === email.trim() && a.password === password
      );

      if (admin) {
        const token = `token_${admin._id}_${Date.now()}`;
        login(token, { id: admin._id, name: admin.name, email: admin.email });
        toast.success("✅ Login Successful. Welcome Admin!");
        navigate("/admin-dashboard");
      } else {
        toast.error("Invalid Admin Credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Failed to connect to admin database.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD – STEP 1: verify email
  // ─────────────────────────────────────────────────────────────────────────
  const handleFpEmailSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fpEmail.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const admins = await adminsAPI.getAll();
      const match = admins.find(
        (a) => a.email?.toLowerCase() === fpEmail.trim().toLowerCase()
      );

      if (match) {
        setFpAdminRecord(match);
        setScreen(SCREEN.FORGOT_RESET);
        toast.success("Email verified! Please set your new password.");
      } else {
        toast.error("No admin account found with this email.");
      }
    } catch (error) {
      console.error("FP Email Error:", error);
      toast.error("Failed to verify email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD – STEP 2: reset password
  // ─────────────────────────────────────────────────────────────────────────
  const handleFpResetSubmit = async (e) => {
    e.preventDefault();

    if (fpNewPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (fpNewPassword !== fpConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await adminsAPI.update(fpAdminRecord._id, {
        ...fpAdminRecord,
        password: fpNewPassword,
      });
      setScreen(SCREEN.FORGOT_DONE);
    } catch (error) {
      console.error("FP Reset Error:", error);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RESET STATE
  // ─────────────────────────────────────────────────────────────────────────
  const resetForgotFlow = () => {
    setFpEmail("");
    setFpAdminRecord(null);
    setFpNewPassword("");
    setFpConfirmPassword("");
    setShowFpPassword(false);
    setScreen(SCREEN.LOGIN);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="select-none">
      {/* Video Background */}
      <video
        className="admin-video-bg"
        src={homeVideo}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920"
      />
      <div className="admin-video-overlay" />

      <div className="admin-login-page">
        <div className="admin-login-card">

          {/* ── LOGO HEADER ──────────────────────────────────────── */}
          <div className="admin-login-header">
            <img src={logo} alt="CaliYog Logo" className="admin-login-logo" />
            {screen === SCREEN.LOGIN && <h1>LOGIN</h1>}
            {screen === SCREEN.FORGOT_EMAIL && <h1>FORGOT PASSWORD</h1>}
            {screen === SCREEN.FORGOT_RESET && <h1>RESET PASSWORD</h1>}
            {screen === SCREEN.FORGOT_DONE && <h1>PASSWORD RESET</h1>}
            <p>CaliYog Admin Panel</p>
          </div>

          {/* ══════════════════════════════════════════════════════════
              SCREEN 1 — LOGIN
          ══════════════════════════════════════════════════════════ */}
          {screen === SCREEN.LOGIN && (
            <form onSubmit={handleLoginSubmit}>
              <div className="admin-form-group">
                <label>
                  <span className="label-icon">📧</span> Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter Admin Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>
                  <span className="label-icon">🔒</span> Password
                </label>
                <div className="admin-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="admin-password-toggle cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <span className="forgot-password">
                <button
                  type="button"
                  className="admin-login-link"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "13px" }}
                  onClick={() => setScreen(SCREEN.FORGOT_EMAIL)}
                >
                  Forgot Password?
                </button>
              </span>

              <button
                type="submit"
                className="admin-login-btn cursor-pointer"
                disabled={loading}
              >
                {loading && <span className="admin-btn-spinner" />}
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════
              SCREEN 2 — FORGOT: verify email
          ══════════════════════════════════════════════════════════ */}
          {screen === SCREEN.FORGOT_EMAIL && (
            <form onSubmit={handleFpEmailSubmit}>
              <p className="fp-hint">
                Enter your registered admin email. We'll verify your account and let you set a new password.
              </p>

              <div className="admin-form-group">
                <label>
                  <span className="label-icon">📧</span> Registered Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your admin email"
                  value={fpEmail}
                  onChange={(e) => setFpEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="admin-login-btn cursor-pointer"
                disabled={loading}
              >
                {loading && <span className="admin-btn-spinner" />}
                {loading ? "Verifying..." : "Verify Email"}
              </button>

              <div className="admin-login-footer">
                <button
                  type="button"
                  className="admin-login-link"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                  onClick={resetForgotFlow}
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════
              SCREEN 3 — FORGOT: set new password
          ══════════════════════════════════════════════════════════ */}
          {screen === SCREEN.FORGOT_RESET && (
            <form onSubmit={handleFpResetSubmit}>
              <p className="fp-hint">
                Account found for <strong style={{ color: "#4ade80" }}>{fpAdminRecord?.email}</strong>.
                Set your new password below.
              </p>

              <div className="admin-form-group">
                <label>
                  <span className="label-icon">🔑</span> New Password
                </label>
                <div className="admin-password-wrapper">
                  <input
                    type={showFpPassword ? "text" : "password"}
                    placeholder="Enter new password (min 6 chars)"
                    value={fpNewPassword}
                    onChange={(e) => setFpNewPassword(e.target.value)}
                    minLength={6}
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    className="admin-password-toggle cursor-pointer"
                    onClick={() => setShowFpPassword(!showFpPassword)}
                  >
                    {showFpPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="admin-form-group">
                <label>
                  <span className="label-icon">🔒</span> Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={fpConfirmPassword}
                  onChange={(e) => setFpConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              {/* Password match indicator */}
              {fpNewPassword && fpConfirmPassword && (
                <p
                  className="fp-match-hint"
                  style={{
                    color: fpNewPassword === fpConfirmPassword ? "#4ade80" : "#f87171",
                    fontSize: "12px",
                    marginBottom: "8px",
                  }}
                >
                  {fpNewPassword === fpConfirmPassword ? "✅ Passwords match" : "❌ Passwords do not match"}
                </p>
              )}

              <button
                type="submit"
                className="admin-login-btn cursor-pointer"
                disabled={loading}
              >
                {loading && <span className="admin-btn-spinner" />}
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <div className="admin-login-footer">
                <button
                  type="button"
                  className="admin-login-link"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                  onClick={resetForgotFlow}
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════
              SCREEN 4 — SUCCESS
          ══════════════════════════════════════════════════════════ */}
          {screen === SCREEN.FORGOT_DONE && (
            <div className="fp-success">
              <div className="fp-success-icon">✅</div>
              <h3>Password Reset Successfully!</h3>
              <p>
                Your admin password has been updated. You can now log in with your new password.
              </p>
              <button
                type="button"
                className="admin-login-btn cursor-pointer"
                onClick={resetForgotFlow}
              >
                Go to Login
              </button>
            </div>
          )}

          {/* ── FOOTER (register link) — only on login screen ───── */}
          {screen === SCREEN.LOGIN && (
            <div className="admin-login-footer">
              Don't have an admin account?{" "}
              <a href="/admin-register" className="admin-login-link">
                Register Admin
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;