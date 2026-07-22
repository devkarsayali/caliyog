import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { adminsAPI } from "../../../api/dataAPI";
import "../../../style/Admin/SettingsTab.css";

function SettingsTab() {
  const getSavedAdmin = () => {
    try {
      const stored = localStorage.getItem("adminUser") || localStorage.getItem("adminData");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const savedAdmin = getSavedAdmin();

  const [profileData, setProfileData] = useState({
    name: savedAdmin.name || "",
    email: savedAdmin.email || "",
    mobile: savedAdmin.mobile || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [dbAdminRecord, setDbAdminRecord] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // States for toggling password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Live validation checks
  const isEmailValid = profileData.email ? profileData.email.includes("@") : true;
  const isMobileValid = profileData.mobile ? profileData.mobile.trim().length === 10 : true;

  const passVal = passwordData.newPassword;
  const hasUppercase = /[A-Z]/.test(passVal);
  const hasLowercase = /[a-z]/.test(passVal);
  const hasNumber = /\d/.test(passVal);
  const hasSymbol = /[^A-Za-z0-9]/.test(passVal);
  const isNewPasswordValid = passVal ? (passVal.length >= 8 && hasUppercase && hasLowercase && hasNumber && hasSymbol) : true;

  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        if (!savedAdmin.email) return;
        const adminsList = await adminsAPI.getAll();
        const found = adminsList.find(a => a.email === savedAdmin.email);
        if (found) {
          setDbAdminRecord(found);
          setProfileData({
            name: found.name || "",
            email: found.email || "",
            mobile: found.mobile || "",
          });
        }
      } catch (error) {
        console.error("Fetch Admin Error:", error);
      }
    };
    fetchAdminDetails();
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    if (!profileData.name || !profileData.email || !profileData.mobile) {
      toast.error("Please fill all profile fields");
      return;
    }

    if (!profileData.email.includes("@")) {
      toast.error("email should a include @");
      return;
    }

    if (profileData.mobile.trim().length !== 10) {
      toast.error("Enter your 10-digit mobile number");
      return;
    }

    if (!dbAdminRecord?._id) {
      toast.error("Admin record ID not found in database");
      return;
    }

    try {
      setLoadingProfile(true);

      const payload = {
        name: profileData.name.trim(),
        email: profileData.email.trim(),
        mobile: profileData.mobile.trim(),
      };

      await adminsAPI.update(dbAdminRecord._id, payload);

      const updatedUser = {
        ...dbAdminRecord,
        ...payload
      };

      localStorage.setItem("adminUser", JSON.stringify(updatedUser));
      localStorage.setItem("adminData", JSON.stringify(updatedUser));
      setDbAdminRecord(updatedUser);

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Profile Update Error:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    const newPassword = passwordData.newPassword;
    const hasU = /[A-Z]/.test(newPassword);
    const hasL = /[a-z]/.test(newPassword);
    const hasN = /\d/.test(newPassword);
    const hasS = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasU || !hasL || !hasN || !hasS) {
      toast.error("Minimum 8 characters with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
      return;
    }

    if (!dbAdminRecord?._id) {
      toast.error("Admin record ID not found in database");
      return;
    }

    // Verify current password
    if (dbAdminRecord.password !== passwordData.currentPassword) {
      toast.error("Current password is incorrect");
      return;
    }

    try {
      setLoadingPassword(true);

      await adminsAPI.update(dbAdminRecord._id, {
        password: passwordData.newPassword
      });

      setDbAdminRecord({
        ...dbAdminRecord,
        password: passwordData.newPassword
      });

      toast.success("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password Update Error:", error);
      toast.error("Failed to update password");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="settings-tab select-none">
      <form className="settings-card" onSubmit={updateProfile}>
        <h3>👤 Profile Information</h3>

        <div className="settings-grid">
          <div className="settings-group">
            <label>Admin Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter admin name"
              value={profileData.name}
              onChange={handleProfileChange}
            />
          </div>

          <div className="settings-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter admin email"
              value={profileData.email}
              onChange={handleProfileChange}
            />
            {!isEmailValid && (
              <span className="validation-error-msg">email should a include @</span>
            )}
          </div>

          <div className="settings-group full">
            <label>Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              placeholder="Enter mobile number"
              value={profileData.mobile}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                setProfileData({ ...profileData, mobile: val });
              }}
              maxLength={10}
            />
            {!isMobileValid && (
              <span className="validation-error-msg">Enter your 10-digit mobile number</span>
            )}
          </div>
        </div>

        <button type="submit" className="settings-btn cursor-pointer" disabled={loadingProfile}>
          {loadingProfile ? "Saving..." : "Save Profile Changes"}
        </button>
      </form>

      <form
        className="settings-card password-card"
        onSubmit={updatePassword}
      >
        <h3>🔒 Change Password</h3>

        <div className="settings-grid">
          <div className="settings-group full">
            <label>Current Password</label>
            <div className="settings-password-wrapper">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                className="settings-password-toggle cursor-pointer"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9 9a3 3 0 1 1 4.24 4.24"></path>
                    <path d="M17.65 17.65A9 9 0 0 1 12 20c-7 0-11-8-11-8a19.82 19.82 0 0 1 3.65-4.65"></path>
                    <path d="M8.88 8.88A3 3 0 0 1 12 8a9 9 0 0 1 5.64 3.43"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="settings-group">
            <label>New Password</label>
            <div className="settings-password-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                className="settings-password-toggle cursor-pointer"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9 9a3 3 0 1 1 4.24 4.24"></path>
                    <path d="M17.65 17.65A9 9 0 0 1 12 20c-7 0-11-8-11-8a19.82 19.82 0 0 1 3.65-4.65"></path>
                    <path d="M8.88 8.88A3 3 0 0 1 12 8a9 9 0 0 1 5.64 3.43"></path>
                  </svg>
                )}
              </button>
            </div>
            {!isNewPasswordValid && (
              <span className="validation-error-msg">Minimum 8 characters with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.</span>
            )}
          </div>

          <div className="settings-group">
            <label>Confirm Password</label>
            <div className="settings-password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                className="settings-password-toggle cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9 9a3 3 0 1 1 4.24 4.24"></path>
                    <path d="M17.65 17.65A9 9 0 0 1 12 20c-7 0-11-8-11-8a19.82 19.82 0 0 1 3.65-4.65"></path>
                    <path d="M8.88 8.88A3 3 0 0 1 12 8a9 9 0 0 1 5.64 3.43"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="settings-btn cursor-pointer"
          disabled={loadingPassword}
        >
          {loadingPassword ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default SettingsTab;
