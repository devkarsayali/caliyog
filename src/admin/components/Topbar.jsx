import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/CaliYog-Logo.png";
import { contactsAPI } from "../../api/dataAPI";
import {
  FiCalendar,
  FiBell,
  FiChevronDown,
  FiUser,
  FiLogOut,
  FiMail
} from "react-icons/fi";
import "../../style/Admin/Topbar.css";

function Topbar({
  isMobile,
  onToggleSidebar,
  onOpenSettings,
  searchText,
  setSearchText,
  setActiveTab,
  activeTab,
}) {
  const getTabTitle = (tab) => {
    const titles = {
      overview: "CaliYog Dashboard",
      about: "About",
      whyChooseUs: "Why Choose Us",
      batches: "Batches",
      membership: "Membership",
      transformations: "Transformations",
      experts: "Experts",
      events: "Events",
      enquiries: "Enquiries",
      followups: "Follow-ups",
      reports: "Reports",
      members: "Members",
      settings: "Settings",
    };
    return titles[tab] || "CaliYog Dashboard";
  };

  const { admin, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const adminName = admin?.name || "Maithili Deshmukh";
  const adminEmail = admin?.email || "admin@caliyog.com";

  // Calculate initials (e.g. Maithili Deshmukh -> MD)
  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const initials = getInitials(adminName);

  // Current formatted date (e.g. Jul 7, 2026)
  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Load new contact enquiries from DB
  const loadNotifications = async () => {
    try {
      const enquiries = await contactsAPI.getAll();
      // filter for new enquiries (status === "New")
      const newEnquiries = (enquiries || []).filter(e => e.status === "New");
      // sort by date desc
      newEnquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(newEnquiries);
    } catch (error) {
      console.error("Load notifications error:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll every 12 seconds to keep it live
    const interval = setInterval(loadNotifications, 12000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    logout();
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(false);
    if (setActiveTab) {
      setActiveTab("enquiries");
    }
  };

  const formatNotificationTime = (createdAt) => {
    if (!createdAt) return "Just now";
    const dateObj = new Date(createdAt);
    if (isNaN(dateObj.getTime())) return "Just now";

    const today = new Date();
    const isToday =
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear();

    if (isToday) {
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    } else {
      return dateObj.toLocaleDateString();
    }
  };

  return (
    <div className="admin-topbar-wrapper select-none">
      <div className="admin-main-topbar">
        {isMobile && (
          <button className="hamburger-btn cursor-pointer" onClick={onToggleSidebar}>
            ☰
          </button>
        )}

        <div className="admin-topbar-brand">
          <img src={logo} alt="CaliYog Logo" />
          <div>
            <h2>{getTabTitle(activeTab)}</h2>
          </div>
        </div>

        {!isMobile && (
          <div className="admin-topbar-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search members, experts, events..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        )}

        {/* Right Section containing Date, Actions and Profile Dropdown */}
        <div className="admin-topbar-right">

          {/* Calendar Date Section */}
          <div className="admin-topbar-date">
            <FiCalendar className="date-icon" />
            <span>{formattedDate}</span>
          </div>

          {/* Quick Action Icons: Notification bell with dropdown */}
          <div className="topbar-actions" ref={notificationRef}>
            <button
              className="topbar-action-btn cursor-pointer"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              title="Notifications"
              style={{ position: 'relative' }}
            >
              <FiBell />
              {notifications.length > 0 && (
                <span className="notification-badge">
                  {notifications.length}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="notifications-dropdown-menu">
                <div className="notifications-header">
                  <h4>Notifications</h4>
                  {notifications.length > 0 && (
                    <span>{notifications.length} New</span>
                  )}
                </div>

                <div className="dropdown-divider" />

                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="empty-notifications">
                      No new contact enquiries.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item._id || item.id}
                        className="notification-item"
                        onClick={handleNotificationClick}
                      >
                        <div className="notification-icon-box">
                          <FiMail />
                        </div>
                        <div className="notification-content">
                          <p>New enquiry received from <strong>{item.name}</strong></p>
                          <span className="notification-time">
                            {formatNotificationTime(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile Dropdown */}
          <div className="admin-profile-card-wrapper" ref={dropdownRef}>
            <div
              className="admin-profile-card cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="profile-avatar">
                {initials}
              </div>
              <div className="profile-info-text">
                <span className="profile-name">{adminName}</span>
                <span className="profile-role">Admin</span>
              </div>
              <FiChevronDown className={`chevron-icon ${isDropdownOpen ? "open" : ""}`} />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-user-header">
                  <div className="profile-avatar large">
                    {initials}
                  </div>
                  <div className="dropdown-user-details">
                    <h4>{adminName}</h4>
                    <p>{adminEmail}</p>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <ul className="dropdown-menu-list">
                  <li onClick={() => { onOpenSettings(); setIsDropdownOpen(false); }}>
                    <FiUser className="menu-icon" />
                    <span>My Profile Setting</span>
                  </li>

                  <div className="dropdown-divider" />

                  <li className="logout-item" onClick={handleLogoutClick}>
                    <FiLogOut className="menu-icon" />
                    <span>Logout</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Topbar;