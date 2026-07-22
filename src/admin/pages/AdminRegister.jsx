import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { adminsAPI } from "../../api/dataAPI";

import "../../style/Admin/AdminCommon.css";
import logo from "../../assets/CaliYog-Logo.png";
import homeVideo from "../../assets/home-video.mp4";

function AdminRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Live checks
  const isEmailValid = formData.email ? formData.email.includes("@") : true;
  const isMobileValid = formData.mobile ? formData.mobile.trim().length === 10 : true;

  const passVal = formData.password;
  const hasUppercase = /[A-Z]/.test(passVal);
  const hasLowercase = /[a-z]/.test(passVal);
  const hasNumber = /\d/.test(passVal);
  const hasSymbol = /[^A-Za-z0-9]/.test(passVal);
  const isPasswordValid = passVal ? (passVal.length >= 8 && hasUppercase && hasLowercase && hasNumber && hasSymbol) : true;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email validation
    if (!formData.email.includes("@")) {
      toast.error("email should a include @");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Phone validation - must be exactly 10 digits
    if (formData.mobile.trim().length !== 10) {
      toast.error("Enter your 10-digit mobile number");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password and Confirm Password do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSymbol) {
      toast.error("Minimum 8 characters with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
      return;
    }

    setLoading(true);

    try {
      await adminsAPI.create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        password: formData.password,
        createdAt: new Date().toISOString(),
      });

      toast.success("Admin Registered Successfully!");
      navigate("/admin-login");
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error("Registration Failed. Account may already exist.");
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
      />
      <div className="admin-video-overlay" />

      <div className="admin-login-page">
        <div className="admin-login-card admin-register-card">
          <div className="admin-login-header">
            <img src={logo} alt="CaliYog Logo" className="admin-login-logo" />
            <h1>REGISTER</h1>
            <p>Create CaliYog Admin Account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label>
                <span className="label-icon">👤</span> Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter Admin Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>
                <span className="label-icon">📧</span> Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter Admin Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {!isEmailValid && (
                <span className="validation-error-msg">email should a include @</span>
              )}
            </div>

            <div className="admin-form-group">
              <label>
                <span className="label-icon">📞</span> Contact Number
              </label>
              <input
                type="tel"
                name="mobile"
                placeholder="Enter 10-digit Contact Number"
                value={formData.mobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData({ ...formData, mobile: val });
                }}
                maxLength={10}
                minLength={10}
                inputMode="numeric"
                required
              />
              {!isMobileValid && (
                <span className="validation-error-msg">Enter your 10-digit mobile number</span>
              )}
            </div>

            <div className="admin-form-group">
              <label>
                <span className="label-icon">🔒</span> Password
              </label>
              <div className="admin-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
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
              {!isPasswordValid && (
                <span className="validation-error-msg">Minimum 8 characters with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.</span>
              )}
            </div>

            <div className="admin-form-group">
              <label>
                <span className="label-icon">🔒</span> Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="admin-login-btn cursor-pointer" disabled={loading}>
              {loading && <span className="admin-btn-spinner" />}
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="admin-login-footer">
            Already have an admin account?{" "}
            <a href="/admin-login" className="admin-login-link">
              Login Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;