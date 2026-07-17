import React, { useEffect, useState } from "react";
import {
  FiMail,
  FiTrash2,
  FiCheckCircle,
  FiX,
  FiPhone,
} from "react-icons/fi";
import toast from 'react-hot-toast';
import { contactsAPI } from "../../../api/dataAPI";
import "../../../style/Admin/EnquiriesTab.css";

function EnquiriesTab() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

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
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>

      <tbody>
        {enquiries.map((item, index) => (
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
            <td>
              <div className="status-cell-container">
                <span
                  className={
                    item.status === "Replied" ? "status-replied" : "status-new"
                  }
                >
                  {item.status || "New"}
                </span>
                {item.status !== "Replied" && (
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

  // ==================== MOBILE CARDS ====================
  const renderCards = () => (
    <div className="enquiry-cards">
      {enquiries.map((item, index) => (
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
                item.status === "Replied" ? "status-replied" : "status-new"
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
                {item.status !== "Replied" && (
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

      {/* Enquiry Detail Modal containing delete and action buttons */}
      {selectedEnquiry && (
        <div className="admin-modal-overlay">
          <div className="admin-modal small-expert-modal">
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
                <span className={selectedEnquiry.status === "Replied" ? "status-replied" : "status-new"}>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default EnquiriesTab;
