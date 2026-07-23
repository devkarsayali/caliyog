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
  // FORGOT PASSWORD – STEP 1: verify email
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
    let match = null;
    let collectionUsed = "admins";

    try {
      const admins = await adminsAPI.getAll();
      match = admins.find(
        (a) => (a.email || a.Email || a.username || "").toString().trim().toLowerCase() === cleanedEmail.toLowerCase()
      );

      if (!match) {
        const singularAdmins = await firestoreHelpers.getAll("admin");
        match = singularAdmins.find(
          (a) => (a.email || a.Email || a.username || "").toString().trim().toLowerCase() === cleanedEmail.toLowerCase()
        );
        if (match) collectionUsed = "admin";
      }

      let firebaseAuthSent = false;
      try {
        await sendPasswordResetEmail(auth, cleanedEmail);
        firebaseAuthSent = true;
        toast.success("Password reset link sent to your email!");
      } catch (authResetErr) {
        console.log("Firebase Auth reset email notice:", authResetErr.code || authResetErr.message);
      }

      if (match) {
        setFpAdminRecord({ ...match, _collection: collectionUsed });
        setScreen(SCREEN.FORGOT_RESET);
        toast.success("Email verified! You can set your new password.");
      } else if (firebaseAuthSent) {
        setScreen(SCREEN.FORGOT_DONE);
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
      if (fpAdminRecord) {
        const targetCol = fpAdminRecord._collection || "admins";
        await firestoreHelpers.update(targetCol, fpAdminRecord._id, {
          ...fpAdminRecord,
          password: fpNewPassword,
        });
      }
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
                    {showFpPassword ? (
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

          {/* ── FOOTER (register link removed) ───── */}
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;