import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiEdit, FiTrash2, FiX } from "react-icons/fi";
import toast from 'react-hot-toast';
import { eventsAPI } from "../../../api/dataAPI";
import "../../../style/Admin/EventsTab.css";

function EventsTab() {
  const [organisedEvents, setOrganisedEvents] = useState([]);
  const [showOrganisedModal, setShowOrganisedModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editId, setEditId] = useState(null);
  const [organisedForm, setOrganisedForm] = useState("");

  const loadData = useCallback(async () => {
    try {
      const data = await eventsAPI.getAll();
      const eventList = data || [];

      setOrganisedEvents(
        eventList.filter(
          (item) => item.eventType === "organized" || item.eventType === "organised"
        )
      );
    } catch (error) {
      console.error("Organized Events Load Error:", error);
      toast.error("Failed to load events");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const closeOrganisedModal = () => {
    setShowOrganisedModal(false);
    setEditId(null);
    setModalMode("add");
    setOrganisedForm("");
  };

  const openOrganisedAdd = () => {
    setModalMode("add");
    setEditId(null);
    setOrganisedForm("");
    setShowOrganisedModal(true);
  };

  const openOrganisedEdit = (evt) => {
    setOrganisedForm(evt.title || "");
    setEditId(evt._id);
    setModalMode("edit");
    setShowOrganisedModal(true);
  };

  const handleOrganisedSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      eventType: "organized",
      title: organisedForm.trim(),
      description: organisedForm.trim(),
      location: "CaliYog Fitness Club",
      date: new Date().toISOString().slice(0, 10),
    };

    try {
      if (modalMode === "add") {
        await eventsAPI.create(payload);
        toast.success("Organized event added successfully");
      } else {
        await eventsAPI.update(editId, payload);
        toast.success("Organized event updated successfully");
      }
      await loadData();
      closeOrganisedModal();
    } catch (error) {
      console.error("Organised Event Save Error:", error);
      toast.error("Failed to save event");
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this organized event?")) return;

    try {
      await eventsAPI.delete(id);
      toast.success("Organized event deleted successfully");
      await loadData();
    } catch (error) {
      console.error("Delete Organized Event Error:", error);
      toast.error("Failed to delete event");
    }
  };

  return (
    <div className="admin-content-window select-none">
      <div className="section-title-row">
        <h2>Major Organized Events</h2>
        <span>{organisedEvents.length} Items</span>
        <button
          type="button"
          className="events-action-btn primary cursor-pointer"
          onClick={openOrganisedAdd}
        >
          <FiPlus /> Add Organized Event
        </button>
      </div>

      <div className="major-events-list">
        {organisedEvents.map((evt) => (
          <div className="major-event-card" key={evt._id}>
            <div>
              <h3>{evt.title || "Untitled Organized Event"}</h3>
              <p>Organized Event</p>
            </div>

            <div className="major-actions">
              <button
                type="button"
                className="small-edit-btn cursor-pointer"
                onClick={() => openOrganisedEdit(evt)}
              >
                <FiEdit />
              </button>

              <button
                type="button"
                className="small-delete-btn cursor-pointer"
                onClick={() => deleteEvent(evt._id)}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}

        {organisedEvents.length === 0 && (
          <div className="admin-empty-box">
            <h3>No Organized Events</h3>
            <p>Click "Add Organized Event" to create your first one.</p>
          </div>
        )}
      </div>

      {showOrganisedModal && (
        <div className="event-modal-overlay animate-fade-in" onClick={closeOrganisedModal}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-modal-header">
              <h3>{modalMode === "add" ? "Add" : "Edit"} Organized Event</h3>
              <button type="button" className="cursor-pointer" onClick={closeOrganisedModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleOrganisedSubmit}>
              <div className="event-modal-body">
                <div className="admin-form-group">
                  <label>Organized Event Name</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={organisedForm}
                    onChange={(e) => setOrganisedForm(e.target.value)}
                    placeholder="e.g. CaliYog Run Club 2026"
                    required
                  />
                </div>
              </div>

              <div className="event-modal-footer">
                <button type="button" className="cancel-btn cursor-pointer" onClick={closeOrganisedModal}>
                  Cancel
                </button>

                <button type="submit" className="save-btn cursor-pointer">
                  Save Organized Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsTab;
