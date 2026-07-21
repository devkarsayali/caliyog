import React, { useEffect, useState } from "react";
import {
  FiMail,
  FiTrash2,
  FiCheckCircle,
  FiX,
  FiPhone,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import toast from 'react-hot-toast';
import { contactsAPI } from "../../../api/dataAPI";
import "../../../style/Admin/EnquiriesTab.css";

function EnquiriesTab() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [followupDate, setFollowupDate] = useState("");
  const [followupStatus, setFollowupStatus] = useState("New");
  const [followupNote, setFollowupNote] = useState("");
  const [filterType, setFilterType] = useState("all");

  const getFilteredEnquiries = () => {
    const today = new Date();
    const todayStr = today.toDateString();

    return enquiries.filter((item) => {
      const itemDateVal = item.createdAt || item.date || item.submittedOn;
      const itemDate = itemDateVal ? new Date(itemDateVal) : null;

      switch (filterType) {
        case "today":
          return itemDate && itemDate.toDateString() === todayStr;
        case "monthly":
          return itemDate &&
            itemDate.getMonth() === today.getMonth() &&
            itemDate.getFullYear() === today.getFullYear();
        case "new":
          return !item.status || item.status === "New";
        case "replied":
          return item.status === "Replied";
        case "in_progress":
          return item.status === "In Progress";
        case "completed":
          return item.status === "Completed";
        case "all":
        default:
          return true;
      }
    });
  };

  const filteredEnquiries = getFilteredEnquiries();

  const renderKpiCards = () => {
    const allCount = enquiries.length;

    const todayDateStr = new Date().toDateString();
    const todayCount = enquiries.filter(item => {
      const d = item.createdAt || item.date || item.submittedOn;
      return d && new Date(d).toDateString() === todayDateStr;
    }).length;

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyCount = enquiries.filter(item => {
      const d = item.createdAt || item.date || item.submittedOn;
      if (!d) return false;
      const dateObj = new Date(d);
      return dateObj.getMonth() === thisMonth && dateObj.getFullYear() === thisYear;
    }).length;

    const newCount = enquiries.filter(item => !item.status || item.status === "New").length;
    const completedCount = enquiries.filter(item => item.status === "Completed").length;

    const cards = [
      { key: "all", label: "ALL ENQUIRIES", count: allCount, sub: "Total messages", color: "#22c55e", bg: "rgba(34,197,94,0.08)", icon: <FiMail /> },
      { key: "today", label: "TODAY'S ENQUIRIES", count: todayCount, sub: "Received today", color: "#a855f7", bg: "rgba(168,85,247,0.08)", icon: <FiClock /> },
      { key: "monthly", label: "MONTHLY ENQUIRIES", count: monthlyCount, sub: "Received this month", color: "#f97316", bg: "rgba(249,115,22,0.08)", icon: <FiCalendar /> },
      { key: "new", label: "NEW ENQUIRIES", count: newCount, sub: "Pending reply", color: "#eab308", bg: "rgba(234,179,8,0.08)", icon: <FiMail /> },
      { key: "completed", label: "COMPLETED ENQUIRIES", count: completedCount, sub: "Completed logs", color: "#64748b", bg: "rgba(100,116,139,0.08)", icon: <FiCheckCircle /> },
    ];

    return (
      <div className="enquiry-kpi-container" style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        marginBottom: '24px'
      }}>
        {cards.map((card) => {
          const isActive = filterType === card.key;
          return (
            <div
              key={card.key}
              onClick={() => setFilterType(card.key)}
              style={{
                flex: '1 1 120px',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '12px 14px',
                border: isActive ? `1.5px solid ${card.color}` : '1.5px solid #e2e8f0',
                borderTop: `4px solid ${card.color}`,
                boxShadow: isActive ? `0 8px 20px -6px ${card.color}40` : '0 4px 12px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100px'
              }}
              className="enquiry-kpi-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em' }}>
                  {card.label}
                </span>
                <div style={{
                  background: card.bg,
                  color: card.color,
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px'
                }}>
                  {card.icon}
                </div>
              </div>

              <div style={{ marginTop: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>
                  {card.count}
                </h3>
                <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                  {card.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getValue = (...values) => {
    const found = values.find(
      (value) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    );
    return found || "-";
  };

  const getContactNumber = (item) => {
    return getValue(
      item.contact,
      item.mobile,
      item.phone,
      item.number,
      item.contactNumber,
      item.phoneNumber,
      item.mobileNumber,
      item.userContact,
      item.userPhone,
      item.whatsapp,
      item.whatsappNumber
    );
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await contactsAPI.getAll();
      setEnquiries(data || []);
    } catch (error) {
      console.error("Load Enquiry Error:", error);
      toast.error("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEnquiry) {
      setFollowupDate(selectedEnquiry.followupDate || "");
      setFollowupStatus(selectedEnquiry.status || "New");
      setFollowupNote(selectedEnquiry.followupNote || "");
      setShowFollowupForm(false);
    }
  }, [selectedEnquiry]);

  const handleFollowupSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    try {
      const id = selectedEnquiry._id || selectedEnquiry.id;
      const updatedFields = {
        status: followupStatus,
        followupDate: followupDate,
        followupNote: followupNote
      };
      await contactsAPI.update(id, updatedFields);
      toast.success("Follow-up saved successfully");
      setSelectedEnquiry(null);
      loadData();
    } catch (error) {
      console.error("Save Follow-up Error:", error);
      toast.error("Failed to save follow-up");
    }
  };

  const handleSaveNote = async () => {
    if (!selectedEnquiry) return;
    try {
      const id = selectedEnquiry._id || selectedEnquiry.id;
      const updatedFields = {
        followupNote: followupNote
      };
      await contactsAPI.update(id, updatedFields);
      toast.success("Note saved successfully");
      setSelectedEnquiry(prev => ({
        ...prev,
        followupNote: followupNote
      }));
      loadData();
    } catch (error) {
      console.error("Save Note Error:", error);
      toast.error("Failed to save note");
    }
  };

  const markReplied = async (id) => {
    try {
      await contactsAPI.update(id, { status: "Replied" });
      toast.success("Enquiry marked as replied");
      loadData();
    } catch (error) {
      console.error("Update Enquiry Error:", error);
      toast.error("Failed to update enquiry");
    }
  };

  const deleteEnquiry = async (id) => {
    const confirmDelete = window.confirm("Do you want to delete this enquiry?");
    if (!confirmDelete) return false;

    try {
      await contactsAPI.delete(id);
      toast.success("Enquiry deleted successfully");
      loadData();
      return true;
    } catch (error) {
      console.error("Delete Enquiry Error:", error);
      toast.error("Failed to delete enquiry");
      return false;
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  // ==================== DESKTOP TABLE ====================
  const renderTable = () => (
    <table className="enquiry-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Email</th>
          <th>Contact</th>
          <th>Message</th>
          <th>Note</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>

      <tbody>
        {filteredEnquiries.map((item, index) => (
          <tr key={item._id || item.id} onClick={() => setSelectedEnquiry(item)}>
            <td>{index + 1}</td>
            <td>
              {getValue(
                item.name,
                item.fullName,
                item.userName,
                item.memberName
              )}
            </td>
            <td>{getValue(item.email, item.userEmail)}</td>
            <td>
              <div className="contact-cell-container">
                <a
                  href={`tel:${getContactNumber(item)}`}
                  className="enquiry-call-link-btn"
                  title="Call User"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiPhone />
                </a>
                <span>{getContactNumber(item)}</span>
              </div>
            </td>
            <td className="message-cell">
              {getValue(item.message, item.msg, item.description)}
            </td>
            <td className="note-cell">
              {item.followupNote || "-"}
            </td>
            <td>
              <div className="status-cell-container">
                <span
                  className={
                    item.status === "Replied" ? "status-replied" :
                      item.status === "In Progress" ? "status-progress" :
                        item.status === "Completed" ? "status-completed" : "status-new"
                  }
                >
                  {item.status || "New"}
                </span>
                {(!item.status || item.status === "New") && (
                  <button
                    type="button"
                    className="enquiry-quick-reply-btn"
                    title="Mark as Replied"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await markReplied(item._id || item.id);
                    }}
                  >
                    <FiCheckCircle />
                  </button>
                )}
              </div>
            </td>
            <td>
              {formatDate(
                item.createdAt || item.date || item.submittedOn
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderCards = () => (
    <div className="enquiry-cards">
      {filteredEnquiries.map((item, index) => (
        <div
          className="enquiry-card-item"
          key={item._id || item.id}
          onClick={() => setSelectedEnquiry(item)}
        >
          <div className="enquiry-card-top">
            <div>
              <span className="enquiry-card-index">#{index + 1}</span>
              <h3>
                {getValue(
                  item.name,
                  item.fullName,
                  item.userName,
                  item.memberName
                )}
              </h3>
            </div>
            <span
              className={
                item.status === "Replied" ? "status-replied" :
                  item.status === "In Progress" ? "status-progress" :
                    item.status === "Completed" ? "status-completed" : "status-new"
              }
            >
              {item.status || "New"}
            </span>
          </div>

          <div className="enquiry-card-body">
            <div className="enquiry-card-row">
              <span className="enquiry-card-label">📧 Email</span>
              <span className="enquiry-card-value">
                {getValue(item.email, item.userEmail)}
              </span>
            </div>

            <div className="enquiry-card-row">
              <span className="enquiry-card-label">📞 Contact</span>
              <span className="enquiry-card-value contact-value-container">
                <a
                  href={`tel:${getContactNumber(item)}`}
                  className="enquiry-call-link-btn"
                  title="Call User"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiPhone />
                </a>
                <span>{getContactNumber(item)}</span>
                {(!item.status || item.status === "New") && (
                  <button
                    type="button"
                    className="enquiry-quick-reply-btn card-version"
                    title="Mark as Replied"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await markReplied(item._id || item.id);
                    }}
                  >
                    <FiCheckCircle />
                  </button>
                )}
              </span>
            </div>

            <div className="enquiry-card-row">
              <span className="enquiry-card-label">📅 Date</span>
              <span className="enquiry-card-value">
                {formatDate(
                  item.createdAt || item.date || item.submittedOn
                )}
              </span>
            </div>

            <div className="enquiry-card-message">
              <span className="enquiry-card-label">💬 Message</span>
              <p>{getValue(item.message, item.msg, item.description)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="enquiry-page select-none">
      {renderKpiCards()}

      {loading ? (
        <div className="empty-enquiry-box">
          <h3>Loading Enquiries...</h3>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="empty-enquiry-box">
          <FiMail />
          <h3>No Enquiries Yet</h3>
          <p>Contact form submissions will appear here.</p>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="empty-enquiry-box">
          <FiMail />
          <h3>No Enquiries Found</h3>
          <p>There are no enquiries matching the selected filter option.</p>
        </div>
      ) : (
        <>
          {/* Desktop view */}
          <div className="admin-table-box enquiry-desktop-view">
            {renderTable()}
          </div>
          {/* Mobile view */}
          <div className="enquiry-mobile-view">{renderCards()}</div>
        </>
      )}

      {/* Enquiry Detail Modal containing delete, action, and follow-up buttons */}
      {selectedEnquiry && (
        <div className="admin-modal-overlay">
          <div className="admin-modal small-expert-modal enquiry-details-modal">
            {!showFollowupForm ? (
              <>
                <div className="admin-modal-header">
                  <h3 className="admin-modal-title">Enquiry Details</h3>
                  <button
                    type="button"
                    className="admin-modal-close cursor-pointer"
                    onClick={() => setSelectedEnquiry(null)}
                  >
                    <FiX />
                  </button>
                </div>

                <div className="admin-modal-body compact-modal-body" style={{ color: '#0f172a', padding: '20px' }}>
                  <div className="enquiry-detail-row">
                    <strong>Name:</strong>
                    <span>
                      {getValue(
                        selectedEnquiry.name,
                        selectedEnquiry.fullName,
                        selectedEnquiry.userName,
                        selectedEnquiry.memberName
                      )}
                    </span>
                  </div>
                  <div className="enquiry-detail-row">
                    <strong>Email:</strong>
                    <span>{getValue(selectedEnquiry.email, selectedEnquiry.userEmail)}</span>
                  </div>
                  <div className="enquiry-detail-row">
                    <strong>Contact:</strong>
                    <div className="contact-cell-container" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <a
                        href={`tel:${getContactNumber(selectedEnquiry)}`}
                        className="enquiry-call-link-btn"
                        title="Call User"
                        style={{ margin: 0 }}
                      >
                        <FiPhone />
                      </a>
                      <span>{getContactNumber(selectedEnquiry)}</span>
                    </div>
                  </div>
                  <div className="enquiry-detail-row">
                    <strong>Status:</strong>
                    <span className={
                      selectedEnquiry.status === "Replied" ? "status-replied" :
                        selectedEnquiry.status === "In Progress" ? "status-progress" :
                          selectedEnquiry.status === "Completed" ? "status-completed" : "status-new"
                    }>
                      {selectedEnquiry.status || "New"}
                    </span>
                  </div>
                  <div className="enquiry-detail-row">
                    <strong>Date:</strong>
                    <span>
                      {formatDate(
                        selectedEnquiry.createdAt || selectedEnquiry.date || selectedEnquiry.submittedOn
                      )}
                    </span>
                  </div>

                  {selectedEnquiry.followupDate && (
                    <div className="enquiry-detail-row">
                      <strong>Follow-up Date:</strong>
                      <span style={{ color: '#3b82f6', fontWeight: '700' }}>
                        {formatDate(selectedEnquiry.followupDate)}
                      </span>
                    </div>
                  )}

                  <div className="enquiry-detail-message" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <strong>Response Note / What User Said:</strong>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'stretch' }}>
                      <textarea
                        className="admin-input-field"
                        style={{ minHeight: '50px', resize: 'vertical', padding: '8px 12px', fontSize: '13px', flex: 1, margin: 0 }}
                        value={followupNote}
                        onChange={(e) => setFollowupNote(e.target.value)}
                        placeholder="Type what the user said..."
                      />
                      <button
                        type="button"
                        className="admin-btn admin-btn-primary cursor-pointer"
                        style={{ alignSelf: 'stretch', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, borderRadius: '12px' }}
                        onClick={handleSaveNote}
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  <div className="enquiry-detail-message">
                    <strong>Message:</strong>
                    <p>{getValue(selectedEnquiry.message, selectedEnquiry.msg, selectedEnquiry.description)}</p>
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary cursor-pointer"
                    onClick={() => setSelectedEnquiry(null)}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="admin-btn cursor-pointer"
                    style={{
                      background: '#3b82f6',
                      color: '#ffffff',
                      borderRadius: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onClick={() => setShowFollowupForm(true)}
                  >
                    <FiCalendar /> Add Followup
                  </button>

                  {selectedEnquiry.status !== "Replied" && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary cursor-pointer"
                      onClick={async () => {
                        await markReplied(selectedEnquiry._id || selectedEnquiry.id);
                        setSelectedEnquiry(null);
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FiCheckCircle /> Mark Replied
                    </button>
                  )}

                  <button
                    type="button"
                    className="admin-btn cursor-pointer"
                    style={{
                      background: '#ef4444',
                      color: '#ffffff',
                      borderRadius: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onClick={async () => {
                      const deleted = await deleteEnquiry(selectedEnquiry._id || selectedEnquiry.id);
                      if (deleted) setSelectedEnquiry(null);
                    }}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="admin-modal-header">
                  <h3 className="admin-modal-title">Manage Follow-up</h3>
                  <button
                    type="button"
                    className="admin-modal-close cursor-pointer"
                    onClick={() => setShowFollowupForm(false)}
                  >
                    <FiX />
                  </button>
                </div>

                <form onSubmit={handleFollowupSubmit}>
                  <div className="admin-modal-body compact-modal-body" style={{ color: '#0f172a', padding: '20px' }}>
                    <div className="enquiry-detail-row" style={{ marginBottom: '10px' }}>
                      <strong>Name:</strong>
                      <span>
                        {getValue(
                          selectedEnquiry.name,
                          selectedEnquiry.fullName,
                          selectedEnquiry.userName,
                          selectedEnquiry.memberName
                        )}
                      </span>
                    </div>

                    <div className="enquiry-detail-row" style={{ marginBottom: '15px' }}>
                      <strong>Contact:</strong>
                      <span>{getContactNumber(selectedEnquiry)}</span>
                    </div>

                    {selectedEnquiry.followupNote && (
                      <div className="enquiry-detail-message" style={{ marginBottom: '15px' }}>
                        <strong>Previous Response:</strong>
                        <p style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px', color: '#334155', fontSize: '13px', marginTop: '4px' }}>
                          {selectedEnquiry.followupNote}
                        </p>
                      </div>
                    )}

                    <div className="enquiry-form-group">
                      <label htmlFor="followup-date">Follow-up Date</label>
                      <input
                        id="followup-date"
                        type="date"
                        className="admin-input-field"
                        value={followupDate}
                        onChange={(e) => setFollowupDate(e.target.value)}
                      />
                    </div>

                    <div className="enquiry-form-group">
                      <label htmlFor="followup-status">Status</label>
                      <select
                        id="followup-status"
                        className="admin-input-field"
                        value={followupStatus}
                        onChange={(e) => setFollowupStatus(e.target.value)}
                      >
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Replied">Replied</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div className="enquiry-form-group">
                      <label htmlFor="followup-note">Follow-up Note / User Response</label>
                      <textarea
                        id="followup-note"
                        className="admin-input-field"
                        placeholder="Enter user's response or notes from the call..."
                        value={followupNote}
                        onChange={(e) => setFollowupNote(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-footer">
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary cursor-pointer"
                      onClick={() => setShowFollowupForm(false)}
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      className="admin-btn admin-btn-primary cursor-pointer"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FiCheckCircle /> Save Follow-up
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EnquiriesTab;
