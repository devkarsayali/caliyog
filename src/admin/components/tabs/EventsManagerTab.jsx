import React, { useState } from "react";
import EventsTab from "./EventsTab";
import GalleryEventsTab from "./GalleryEventsTab";
import "../../../style/Admin/EventsTab.css";

function EventsManagerTab() {
  const [selectedEventPage, setSelectedEventPage] = useState("");

  if (selectedEventPage === "organized") {
    return (
      <>
        <div className="page-header select-none">
          <button
            type="button"
            className="back-btn cursor-pointer"
            onClick={() => setSelectedEventPage("")}
          >
            ← Back
          </button>
        </div>

        <EventsTab />
      </>
    );
  }

  if (selectedEventPage === "gallery") {
    return (
      <>
        <div className="page-header select-none">
          <button
            type="button"
            className="back-btn cursor-pointer"
            onClick={() => setSelectedEventPage("")}
          >
            ← Back
          </button>
        </div>

        <GalleryEventsTab />
      </>
    );
  }

  return (
    <div className="admin-selection-page select-none">
      <h2>Events Management</h2>
      <p>Select which events section you want to manage.</p>

      <div className="admin-selection-cards">
        <button
          type="button"
          className="cursor-pointer"
          onClick={() => setSelectedEventPage("organized")}
        >
          <span>🎉</span>
          <h3>Organized Events</h3>
          <p>Manage main events organized by CaliYog.</p>
        </button>

        <button 
          type="button" 
          className="cursor-pointer"
          onClick={() => setSelectedEventPage("gallery")}
        >
          <span>🖼️</span>
          <h3>Gallery Events</h3>
          <p>Manage event gallery images and memories.</p>
        </button>
      </div>
    </div>
  );
}

export default EventsManagerTab;
