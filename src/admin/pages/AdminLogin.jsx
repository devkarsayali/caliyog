import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { adminsAPI } from "../../api/dataAPI";

import "../../style/Admin/AdminCommon.css";
import logo from "../../assets/CaliYog-Logo.png";
import homeVideo from "../../assets/home-video.mp4";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const admins = await adminsAPI.getAll();
      const admin = admins.find(a => a.email === email && a.password === password);

      if (admin) {
        const confirmation = window.confirm(
          `⚠️ Security Check\n\nAn admin login attempt was detected.\n\nAdmin Email:\n${email}\n\nIs this you?\n\nPress OK if yes.\nPress Cancel if not.`
        );

        if (!confirmation) {
          toast.error("🚨 Login cancelled. Unauthorized attempt blocked.");
          setLoading(false);
          return;
        }

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
          <div className="admin-login-header">
            <img src={logo} alt="CaliYog Logo" className="admin-login-logo" />
            <h1>LOGIN</h1>
            <p>CaliYog Admin Panel</p>
          </div>

          <form onSubmit={handleSubmit}>
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

            <button type="submit" className="admin-login-btn cursor-pointer" disabled={loading}>
              {loading && <span className="admin-btn-spinner" />}
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="admin-login-footer">
            Don't have an admin account?{" "}
            <a href="/admin-register" className="admin-login-link">
              Register Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;