import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../style/Admin/Sidebar.css";

function Sidebar({ isOpen, isMobile, activeTab, setActiveTab, onClose, onToggle }) {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const adminData = admin || JSON.parse(localStorage.getItem("adminData")) || {};

  const handleLogout = () => {
    logout();
    localStorage.removeItem("admin");
    localStorage.removeItem("adminData");
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (isMobile && onClose) onClose();
  };

  const menuItems = [
    { key: "overview", icon: "🏠", label: "Dashboard" },
    { key: "about", icon: "📝", label: "About" },
    { key: "whyChooseUs", icon: "⭐", label: "Why Choose Us" },
    { key: "batches", icon: "🏋️", label: "Batches" },
    { key: "membership", icon: "💳", label: "Membership" },
    { key: "transformations", icon: "🔥", label: "Transformations" },
    { key: "experts", icon: "👨‍🏫", label: "Experts" },
    { key: "events", icon: "🎉", label: "Events" },
    { key: "enquiries", icon: "📩", label: "Enquiries" },
    { key: "reports", icon: "📋", label: "Reports" },
    { key: "members", icon: "👥", label: "Members" },
    { key: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <>
      {/* TOGGLE BUTTON - ONLY on Desktop (NOT on mobile) */}
      {!isMobile && (
        <button
          type="button"
          className={`sidebar-toggle-floating ${isOpen ? "is-open" : "is-closed"} cursor-pointer`}
          onClick={onToggle}
          aria-label={isOpen ? "Close Sidebar" : "Open Sidebar"}
          title={isOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isOpen ? "‹" : "›"}
        </button>
      )}

      <aside className={`admin-sidebar ${isOpen ? "open" : "closed"} ${isMobile ? "mobile-mode" : "desktop-mode"} select-none`}>
        <div className="admin-sidebar-title"></div>

        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.key}
              title={item.label}
              className={`${activeTab === item.key ? "active" : ""} cursor-pointer`}
              onClick={() => handleTabClick(item.key)}
            >
              <span>{item.icon}</span>
              <b>{item.label}</b>
            </button>
          ))}
        </div>

        <div className="sidebar-bottom-box">
          <div className="admin-profile-card">
            <div className="admin-profile-avatar">
              {adminData?.name ? adminData.name.charAt(0).toUpperCase() : "A"}
            </div>

            <div className="admin-profile-info">
              <h4>{adminData?.name || "Admin"}</h4>
              <p className="truncate max-w-[130px]">{adminData?.email || "admin@caliyog.com"}</p>
              <span>● Active</span>
            </div>
          </div>

          <button title="Logout" className="logout-btn cursor-pointer" onClick={handleLogout}>
            <span>🚪</span>
            <b>Logout</b>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;