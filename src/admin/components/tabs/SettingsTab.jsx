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

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
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
          </div>

          <div className="settings-group full">
            <label>Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              placeholder="Enter mobile number"
              value={profileData.mobile}
              onChange={handleProfileChange}
            />
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
            <input
              type="password"
              name="currentPassword"
              placeholder="Enter current password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
            />
          </div>

          <div className="settings-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter new password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
            />
          </div>

          <div className="settings-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
            />
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
