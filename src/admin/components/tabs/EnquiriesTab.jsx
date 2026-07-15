import React, { useEffect, useState } from "react";
import {
  FiMail,
  FiTrash2,
  FiCheckCircle,
} from "react-icons/fi";
import toast from 'react-hot-toast';
import { contactsAPI } from "../../../api/dataAPI";
import "../../../style/Admin/EnquiriesTab.css";

function EnquiriesTab() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const confirmDelete = window.confirm("Delete this enquiry?");
    if (!confirmDelete) return;

    try {
      await contactsAPI.delete(id);
      toast.success("Enquiry deleted successfully");
      loadData();
    } catch (error) {
      console.error("Delete Enquiry Error:", error);
      toast.error("Failed to delete enquiry");
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
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {enquiries.map((item, index) => (
          <tr key={item._id || item.id}>
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
            <td>{getContactNumber(item)}</td>
            <td className="message-cell">
              {getValue(item.message, item.msg, item.description)}
            </td>
            <td>
              <span
                className={
                  item.status === "Replied" ? "status-replied" : "status-new"
                }
              >
                {item.status || "New"}
              </span>
            </td>
            <td>
              {formatDate(
                item.createdAt || item.date || item.submittedOn
              )}
            </td>
            <td className="action-cell">
              {item.status !== "Replied" && (
                <button
                  type="button"
                  className="reply-btn cursor-pointer"
                  onClick={() => markReplied(item._id || item.id)}
                >
                  <FiCheckCircle />
                </button>
              )}
              <button
                type="button"
                className="delete-btn cursor-pointer"
                onClick={() => deleteEnquiry(item._id || item.id)}
              >
                <FiTrash2 />
              </button>
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
        <div className="enquiry-card-item" key={item._id || item.id}>
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
              <span className="enquiry-card-value">
                {getContactNumber(item)}
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

          <div className="enquiry-card-footer">
            {item.status !== "Replied" && (
              <button
                type="button"
                className="reply-btn cursor-pointer"
                onClick={() => markReplied(item._id || item.id)}
              >
                <FiCheckCircle /> Mark Replied
              </button>
            )}
            <button
              type="button"
              className="delete-btn cursor-pointer"
              onClick={() => deleteEnquiry(item._id || item.id)}
            >
              <FiTrash2 /> Delete
            </button>
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
    </div>
  );
}

export default EnquiriesTab;
