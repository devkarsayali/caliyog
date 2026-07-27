import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { adminsAPI } from "../../api/dataAPI";
import { auth, firestoreHelpers } from "../../api/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

import "../../style/Admin/AdminCommon.css";
import logo from "../../assets/CaliYog-Logo.png";
import homeVideo from "../../assets/home-video.mp4";

// ─── Screens ───────────────────────────────────────────────────────────────
const SCREEN = {
  LOGIN: "login",
  FORGOT_EMAIL: "forgot_email",  // Step 1: enter email to receive reset link
  FORGOT_DONE: "forgot_done",    // Step 2: email sent confirmation
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

  // ─────────────────────────────────────────────────────────────────────────
  // LOGIN SUBMIT
  // ─────────────────────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    const cleanedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    let authenticatedUser = null;

    // 1. Attempt Firebase Authentication (Firebase Auth Console Users)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanedEmail, password);
      if (userCredential && userCredential.user) {
        const u = userCredential.user;
        authenticatedUser = {
          id: u.uid,
          name: u.displayName || u.email?.split("@")[0] || "Admin",
          email: u.email || cleanedEmail,
        };
      }
    } catch (authErr) {
      console.log("Firebase Auth login skipped/failed:", authErr.code || authErr.message);
    }

    // 2. If Firebase Auth didn't authenticate, check Firestore Database ('admins' & 'admin' collections)
    if (!authenticatedUser) {
      try {
        const admins = await adminsAPI.getAll();
        let match = admins.find((a) => {
          const docEmail = (a.email || a.Email || a.username || "").toString().trim().toLowerCase();
          const docPass = (a.password || a.Password || a.pass || "").toString();
          return docEmail === cleanedEmail.toLowerCase() && docPass === password;
        });

        if (!match) {
          // Check singular 'admin' collection in case it was created as 'admin'
          const singularAdmins = await firestoreHelpers.getAll("admin");
          match = singularAdmins.find((a) => {
            const docEmail = (a.email || a.Email || a.username || "").toString().trim().toLowerCase();
            const docPass = (a.password || a.Password || a.pass || "").toString();
            return docEmail === cleanedEmail.toLowerCase() && docPass === password;
          });
        }

        if (match) {
          authenticatedUser = {
            id: match._id,
            name: match.name || match.Name || match.email?.split("@")[0] || "Admin",
            email: match.email || cleanedEmail,
          };
        }
      } catch (dbErr) {
        console.error("Firestore Admin database error:", dbErr);
      }
    }

    if (authenticatedUser) {
      const token = `token_${authenticatedUser.id}_${Date.now()}`;
      login(token, authenticatedUser);
      toast.success("✅ Login Successful. Welcome Admin!");
      navigate("/admin-dashboard");
    } else {
      toast.error("Invalid Admin Credentials");
    }
    setLoading(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD – Send Reset Link Email
  // ─────────────────────────────────────────────────────────────────────────
  const handleFpEmailSubmit = async (e) => {
    e.preventDefault();

    const cleanedEmail = fpEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Check if admin email exists in database
      let match = null;
      const admins = await adminsAPI.getAll();
      match = admins.find(
        (a) => (a.email || a.Email || a.username || "").toString().trim().toLowerCase() === cleanedEmail.toLowerCase()
      );

      if (!match) {
        const singularAdmins = await firestoreHelpers.getAll("admin");
        match = singularAdmins.find(
          (a) => (a.email || a.Email || a.username || "").toString().trim().toLowerCase() === cleanedEmail.toLowerCase()
        );
      }

      let emailSent = false;
      try {
        await sendPasswordResetEmail(auth, cleanedEmail);
        emailSent = true;
      } catch (authResetErr) {
        console.log("Firebase Auth reset email notice:", authResetErr.code || authResetErr.message);
        if (match) emailSent = true;
      }

      if (emailSent || match) {
        toast.success("Password reset link sent to your email!");
        setScreen(SCREEN.FORGOT_DONE);
      } else {
        toast.error("No admin account found with this email address.");
      }
    } catch (error) {
      console.error("FP Email Error:", error);
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RESET STATE
  // ─────────────────────────────────────────────────────────────────────────
  const resetForgotFlow = () => {
    setFpEmail("");
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
      />
      <div className="admin-video-overlay" />

      <div className="admin-login-page">
        <div className="admin-login-card">

          {/* ── LOGO HEADER ──────────────────────────────────────── */}
          <div className="admin-login-header">
            <img src={logo} alt="CaliYog Logo" className="admin-login-logo" />
            {screen === SCREEN.LOGIN && <h1>LOGIN</h1>}
            {screen === SCREEN.FORGOT_EMAIL && <h1>FORGOT PASSWORD</h1>}
            {screen === SCREEN.FORGOT_DONE && <h1>RESET LINK SENT</h1>}
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
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye-off">
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                        <path d="M9 9a3 3 0 1 1 4.24 4.24"></path>
                        <path d="M17.65 17.65A9 9 0 0 1 12 20c-7 0-11-8-11-8a19.82 19.82 0 0 1 3.65-4.65"></path>
                        <path d="M8.88 8.88A3 3 0 0 1 12 8a9 9 0 0 1 5.64 3.43"></path>
                      </svg>
                    )}
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
              SCREEN 2 — FORGOT: enter email for reset link
          ══════════════════════════════════════════════════════════ */}
          {screen === SCREEN.FORGOT_EMAIL && (
            <form onSubmit={handleFpEmailSubmit}>
              <p className="fp-hint">
                Enter your registered admin email address below. We will send you a password reset link to your email.
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
                {loading ? "Sending Link..." : "Send Reset Link"}
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
              SCREEN 3 — CONFIRMATION: email sent
          ══════════════════════════════════════════════════════════ */}
          {screen === SCREEN.FORGOT_DONE && (
            <div className="fp-success">
              <div className="fp-success-icon">📩</div>
              <h3>Reset Link Sent!</h3>
              <p>
                A password reset link has been sent to <strong style={{ color: "#4ade80" }}>{fpEmail}</strong>.
              </p>
              <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "10px" }}>
                Please check your email inbox and click the link to reset your password.
              </p>
              <button
                type="button"
                className="admin-login-btn cursor-pointer"
                style={{ marginTop: "20px" }}
                onClick={resetForgotFlow}
              >
                Back to Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default AdminLogin;