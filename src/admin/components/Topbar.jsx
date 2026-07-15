import React from "react";
import logo from "../../assets/CaliYog-Logo.png";
import "../../style/Admin/Topbar.css";

function Topbar({
  isMobile,
  onToggleSidebar,
  onOpenSettings,
  searchText,
  setSearchText,
}) {
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
            <span>Admin Portal</span>
            <h2>CaliYog Dashboard</h2>
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

        {!isMobile && (
          <button className="admin-topbar-settings cursor-pointer" onClick={onOpenSettings}>
            ⚙️ Settings
          </button>
        )}
      </div>
    </div>
  );
}

export default Topbar;