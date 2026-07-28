import React, { useState } from "react";
import toast from 'react-hot-toast';
import { useAuth } from "../../../context/AuthContext";
import { adminsAPI } from "../../../api/dataAPI";
import { auth, firestoreHelpers } from "../../../api/firebase";
import { signInWithEmailAndPassword, updatePassword as updateFbPassword } from "firebase/auth";
import "../../../style/Admin/SettingsTab.css";

function SettingsTab() {
  const { admin, updateAdminData } = useAuth();
  const savedAdmin = admin || {};

  const [email, setEmail] = useState(savedAdmin.email || "");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // States for toggling password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Live validation checks
  const isEmailValid = email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) : true;

  const passVal = passwordData.newPassword;
  const hasUppercase = /[A-Z]/.test(passVal);
  const hasLowercase = /[a-z]/.test(passVal);
  const hasNumber = /\d/.test(passVal);
  const hasSymbol = /[^A-Za-z0-9]/.test(passVal);
  const isNewPasswordValid = passVal ? (passVal.length >= 8 && hasUppercase && hasLowercase && hasNumber && hasSymbol) : true;

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    const cleanedEmail = email.trim();
    if (!cleanedEmail) {
      toast.error("Please enter email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

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

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSymbol) {
      toast.error("Minimum 8 characters with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
      return;
    }

    try {
      setLoading(true);

      // 1. Search for matching admin record in Firestore collections
      let match = null;
      let targetCollection = "admins";

      try {
        const adminsList = await adminsAPI.getAll();
        match = adminsList.find(
          (a) =>
            a._id === savedAdmin.id ||
            a._id === savedAdmin._id ||
            (a.email || a.Email || a.username || "").toString().trim().toLowerCase() === cleanedEmail.toLowerCase()
        );
      } catch (err) {
        console.warn("Error searching admins collection:", err);
      }

      if (!match) {
        try {
          const singularAdmins = await firestoreHelpers.getAll("admin");
          match = singularAdmins.find(
            (a) =>
              a._id === savedAdmin.id ||
              a._id === savedAdmin._id ||
              (a.email || a.Email || a.username || "").toString().trim().toLowerCase() === cleanedEmail.toLowerCase()
          );
          if (match) targetCollection = "admin";
        } catch (err) {
          console.warn("Error searching admin collection:", err);
        }
      }

      // 2. Verify current password against Firebase Auth and/or Firestore database record
      let isCurrentPasswordValid = false;

      // Check Firebase Auth first (to support passwords updated via email reset link)
      try {
        await signInWithEmailAndPassword(auth, cleanedEmail, passwordData.currentPassword);
        isCurrentPasswordValid = true;
      } catch (fbAuthErr) {
        console.log("Firebase Auth check with current password:", fbAuthErr.code || fbAuthErr.message);
      }

      // Fallback check against Firestore database document
      if (!isCurrentPasswordValid && match) {
        const dbPassword = (match.password || match.Password || match.pass || "").toString();
        if (dbPassword && dbPassword === passwordData.currentPassword) {
          isCurrentPasswordValid = true;
        }
      }

      if (!isCurrentPasswordValid) {
        toast.error("Current password is incorrect");
        setLoading(false);
        return;
      }

      // 3. Update Firestore database document
      const updateData = {
        email: cleanedEmail,
        password: passwordData.newPassword,
      };

      if (match) {
        if (match.Password !== undefined) updateData.Password = passwordData.newPassword;
        if (match.pass !== undefined) updateData.pass = passwordData.newPassword;

        await firestoreHelpers.update(targetCollection, match._id, updateData);
      } else {
        // Create new admin document if not present in Firestore yet
        const newRecord = {
          email: cleanedEmail,
          password: passwordData.newPassword,
          name: savedAdmin.name || cleanedEmail.split("@")[0] || "Admin",
          createdAt: new Date().toISOString(),
        };
        const created = await firestoreHelpers.create("admins", newRecord);
        match = created;
      }

      // 4. Also update Firebase Auth user password if active
      if (auth.currentUser) {
        try {
          await updateFbPassword(auth.currentUser, passwordData.newPassword);
        } catch (fbAuthErr) {
          console.log("Firebase Auth password update note:", fbAuthErr.message);
        }
      }

      // 5. Update cached admin record in AuthContext
      const updatedUser = {
        ...savedAdmin,
        ...(match || {}),
        email: cleanedEmail,
        password: passwordData.newPassword,
      };

      if (updateAdminData) {
        updateAdminData(updatedUser);
      }

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
      setLoading(false);
    }
  };


  return (
    <div className="settings-tab select-none">
      <form
        className="settings-card password-card"
        onSubmit={handleUpdatePassword}
      >
        <h3>🔒 Change Admin Password</h3>

        <div className="settings-grid">
          <div className="settings-group full">
            <label>Admin Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!isEmailValid && (
              <span className="validation-error-msg">Please enter a valid email address</span>
            )}
          </div>

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
          disabled={loading}
        >
          {loading ? "Updating Password..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default SettingsTab;

