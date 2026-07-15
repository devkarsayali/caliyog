import React, { useState } from "react";
import ReportsTab from "./ReportsTab";
import KidsReportsTab from "./KidsReportsTab";
import "../../../style/Admin/EventsTab.css"; // uses same classes as Events tab selection page

function ReportsManagerTab() {
  const [selectedReportPage, setSelectedReportPage] = useState("");

  if (selectedReportPage === "all") {
    return (
      <>
        <div className="page-header select-none">
          <button
            type="button"
            className="back-btn cursor-pointer"
            onClick={() => setSelectedReportPage("")}
          >
            ← Back
          </button>
        </div>

        <ReportsTab />
      </>
    );
  }

  if (selectedReportPage === "kids") {
    return (
      <>
        <div className="page-header select-none">
          <button
            type="button"
            className="back-btn cursor-pointer"
            onClick={() => setSelectedReportPage("")}
          >
            ← Back
          </button>
        </div>

        <KidsReportsTab />
      </>
    );
  }

  return (
    <div className="admin-selection-page select-none">
      <h2>Reports Management</h2>
      <p>Select which report section you want to manage.</p>

      <div className="admin-selection-cards">
        <button
          type="button"
          className="cursor-pointer"
          onClick={() => setSelectedReportPage("all")}
        >
          <span>📋</span>
          <h3>All Members</h3>
          <p>View and manage all membership reports.</p>
        </button>

        <button
          type="button"
          className="cursor-pointer"
          onClick={() => setSelectedReportPage("kids")}
        >
          <span>🧒</span>
          <h3>Kids Section</h3>
          <p>View and manage kids section reports.</p>
        </button>
      </div>
    </div>
  );
}

export default ReportsManagerTab;
