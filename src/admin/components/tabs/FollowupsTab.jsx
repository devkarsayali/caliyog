import React, { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiX,
  FiPhone,
  FiCalendar,
  FiClock,
  FiMail,
} from "react-icons/fi";
import toast from 'react-hot-toast';
import { contactsAPI } from "../../../api/dataAPI";
import "../../../style/Admin/EnquiriesTab.css"; // Reuse existing enquiries layout styles

function FollowupsTab() {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [followupDate, setFollowupDate] = useState("");
  const [followupStatus, setFollowupStatus] = useState("New");
  const [followupNote, setFollowupNote] = useState("");
  const [filterType, setFilterType] = useState("all");

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const isOverdueItem = (item) => {
    if (!item.followupDate) return false;
    const status = item.status || "New";
    if (
      status === "Completed" ||
      status === "Cancelled" ||
      status === "Canceled" ||
      status === "Cancled"
    ) {
      return false;
    }
    const fDate = new Date(item.followupDate);
    if (isNaN(fDate.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fDateNormalized = new Date(
      fDate.getFullYear(),
      fDate.getMonth(),
      fDate.getDate()
    );

    return fDateNormalized < today;
  };

  const isTodayFollowup = (item, todayDateStr) => {
    if (!item.followupDate) return false;
    const fDate = new Date(item.followupDate);
    if (isNaN(fDate.getTime())) return false;
    const yyyy = fDate.getFullYear();
    const mm = String(fDate.getMonth() + 1).padStart(2, '0');
    const dd = String(fDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}` === todayDateStr;
  };

  const getFilteredFollowups = () => {
    const todayDateStr = getTodayDateString();
    return followups.filter((item) => {
      switch (filterType) {
        case "today":
          return isTodayFollowup(item, todayDateStr);
        case "overdue":
          return isOverdueItem(item);
        case "completed":
          return item.status === "Completed";
        case "cancelled":
          return (
            item.status === "Cancelled" ||
            item.status === "Canceled" ||
            item.status === "Cancled"
          );
        case "all":
        default:
          return true;
      }
    });
  };

  const filteredFollowups = getFilteredFollowups();

  const renderKpiCards = () => {
    const allCount = followups.length;
    const todayDateStr = getTodayDateString();
    const todayCount = followups.filter((item) => isTodayFollowup(item, todayDateStr)).length;
    const overdueCount = followups.filter((item) => isOverdueItem(item)).length;
    const completedCount = followups.filter((item) => item.status === "Completed").length;
    const cancelledCount = followups.filter(
      (item) => item.status === "Cancelled" || item.status === "Canceled" || item.status === "Cancled"
    ).length;

    const cards = [
      { key: "all", label: "ALL FOLLOW-UPS", count: allCount, sub: "Total records", color: "#22c55e", bg: "rgba(34,197,94,0.08)", icon: <FiMail /> },
      { key: "today", label: "TODAY'S FOLLOW-UPS", count: todayCount, sub: "Scheduled today", color: "#a855f7", bg: "rgba(168,85,247,0.08)", icon: <FiClock /> },
      { key: "overdue", label: "OVERDUE", count: overdueCount, sub: "Pending past date", color: "#f97316", bg: "rgba(249,115,22,0.08)", icon: <FiClock /> },
      { key: "completed", label: "COMPLETED", count: completedCount, sub: "Completed logs", color: "#10b981", bg: "rgba(16,185,129,0.08)", icon: <FiCheckCircle /> },
      { key: "cancelled", label: "CANCELLED", count: cancelledCount, sub: "Cancelled logs", color: "#ef4444", bg: "rgba(239,68,68,0.08)", icon: <FiX /> },
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
              onClick={() => setFilterType((prev) => (prev === card.key ? "all" : card.key))}
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
      // Filter only enquiries that have follow-up date or follow-up note
      const filtered = (data || []).filter(
        (item) => item.followupDate || item.followupNote
      );
      // Sort: nearest follow-up date first
      filtered.sort((a, b) => {
        if (!a.followupDate) return 1;
        if (!b.followupDate) return -1;
        return new Date(a.followupDate) - new Date(b.followupDate);
      });
      setFollowups(filtered);
    } catch (error) {
      console.error("Load Followups Error:", error);
      toast.error("Failed to load follow-up records");
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
      toast.success("Follow-up updated successfully");
      
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
          <th>Contact</th>
          <th>Follow-up Date</th>
          <th>User Response / Note</th>
          <th>Status</th>
          <th>Original Date</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {filteredFollowups.map((item, index) => (
          <tr key={item._id || item.id} onClick={() => setSelectedEnquiry(item)}>
            <td>{index + 1}</td>
            <td>
              <strong>
                {getValue(
                  item.name,
                  item.fullName,
                  item.userName,
                  item.memberName
                )}
              </strong>
            </td>
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
            <td>
              <span style={{
                color: isOverdueItem(item) ? '#dc2626' : '#3b82f6',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <FiClock /> {item.followupDate ? formatDate(item.followupDate) : "-"}
                {isOverdueItem(item) && (
                  <span style={{
                    fontSize: '10px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginLeft: '4px',
                    fontWeight: '700'
                  }}>Overdue</span>
                )}
              </span>
            </td>
            <td className="message-cell" title={item.followupNote || ""}>
              {item.followupNote ? (
                item.followupNote.length > 50 ? (
                  `${item.followupNote.substring(0, 50)}...`
                ) : (
                  item.followupNote
                )
              ) : (
                "-"
              )}
            </td>
            <td>
              <span
                className={
                  item.status === "Replied" ? "status-replied" :
                  item.status === "Completed" ? "status-completed" :
                  (item.status === "Cancelled" || item.status === "Canceled" || item.status === "Cancled") ? "status-cancelled" :
                  item.status === "In Progress" ? "status-progress" : "status-new"
                }
              >
                {item.status || "New"}
              </span>
            </td>
            <td>
              {formatDate(item.createdAt || item.date || item.submittedOn)}
            </td>
            <td>
              <button
                type="button"
                className="enquiry-followup-text-btn"
                title="Update Follow-up"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEnquiry(item);
                  setTimeout(() => setShowFollowupForm(true), 50);
                }}
              >
                <FiCalendar style={{ marginRight: '6px' }} /> Update
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderCards = () => (
    <div className="enquiry-cards">
      {filteredFollowups.map((item, index) => (
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
                 item.status === "Completed" ? "status-completed" :
                 (item.status === "Cancelled" || item.status === "Canceled" || item.status === "Cancled") ? "status-cancelled" :
                 item.status === "In Progress" ? "status-progress" : "status-new"
              }
            >
              {item.status || "New"}
            </span>
          </div>

          <div className="enquiry-card-body">
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
              </span>
            </div>

            <div className="enquiry-card-row">
              <span className="enquiry-card-label">🗓️ Follow-up Date</span>
              <span className="enquiry-card-value" style={{ color: '#3b82f6', fontWeight: '700' }}>
                {item.followupDate ? formatDate(item.followupDate) : "-"}
              </span>
            </div>

            <div className="enquiry-card-row">
              <span className="enquiry-card-label">📝 Response/Note</span>
              <span className="enquiry-card-value">
                {item.followupNote || "-"}
              </span>
            </div>

            <div className="enquiry-card-row">
              <span className="enquiry-card-label">📅 Original Date</span>
              <span className="enquiry-card-value">
                {formatDate(item.createdAt || item.date || item.submittedOn)}
              </span>
            </div>

            <div className="enquiry-card-row">
              <span className="enquiry-card-label">⚙️ Action</span>
              <span className="enquiry-card-value">
                <button
                  type="button"
                  className="enquiry-followup-btn mobile-version"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEnquiry(item);
                    setTimeout(() => setShowFollowupForm(true), 50);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  <FiCalendar /> Update
                </button>
              </span>
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
          <h3>Loading Follow-up Records...</h3>
        </div>
      ) : followups.length === 0 ? (
        <div className="empty-enquiry-box">
          <FiCalendar style={{ fontSize: '40px', color: '#cbd5e1', marginBottom: '10px' }} />
          <h3>No Follow-ups Scheduled</h3>
          <p>Go to the Enquiries tab, select a record, and click Add Followup to set one.</p>
        </div>
      ) : filteredFollowups.length === 0 ? (
        <div className="empty-enquiry-box">
          <FiCalendar style={{ fontSize: '40px', color: '#cbd5e1', marginBottom: '10px' }} />
          <h3>No Follow-ups Found</h3>
          <p>There are no follow-up activities matching the selected filter option.</p>
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

      {/* Enquiry Detail Modal containing update sub-form */}
      {selectedEnquiry && (
        <div className="admin-modal-overlay">
          <div className="admin-modal small-expert-modal enquiry-details-modal">
            {!showFollowupForm ? (
              <>
                <div className="admin-modal-header">
                  <h3 className="admin-modal-title">Follow-up Details</h3>
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
                       selectedEnquiry.status === "Completed" ? "status-completed" :
                       (selectedEnquiry.status === "Cancelled" || selectedEnquiry.status === "Canceled" || selectedEnquiry.status === "Cancled") ? "status-cancelled" :
                       selectedEnquiry.status === "In Progress" ? "status-progress" : "status-new"
                    }>
                      {selectedEnquiry.status || "New"}
                    </span>
                  </div>
                  <div className="enquiry-detail-row">
                    <strong>Follow-up Date:</strong>
                    <span style={{ color: '#3b82f6', fontWeight: '700' }}>
                      {selectedEnquiry.followupDate ? formatDate(selectedEnquiry.followupDate) : "-"}
                    </span>
                  </div>
                  <div className="enquiry-detail-row">
                    <strong>Enquiry Date:</strong>
                    <span>
                      {formatDate(
                        selectedEnquiry.createdAt || selectedEnquiry.date || selectedEnquiry.submittedOn
                      )}
                    </span>
                  </div>

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
                    <strong>Original Enquiry Message:</strong>
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
                    <FiCalendar /> Update Follow-up
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
                        <option value="Replied">Replied</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
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

export default FollowupsTab;
