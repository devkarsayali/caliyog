import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { membersAPI, batchMembersAPI } from "../../../api/dataAPI";
import toast from 'react-hot-toast';
import "../../../style/Admin/AddMemberForm.css";

function AddMemberForm({ closeForm, onMemberAdded }) {
  const [batch, setBatch] = useState("");
  const [timingType, setTimingType] = useState("");
  const [membership, setMembership] = useState("");
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD format
    return new Date().toISOString().split('T')[0];
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    parentName: "",
    parentContact: "",
    timing: "",
    transactionType: "",
  });

  const morningTimes = [
    "6:00 AM - 7:00 AM",
    "7:00 AM - 8:00 AM",
    "8:00 AM - 9:00 AM",
    "10:00 AM - 11:00 AM",
  ];

  const eveningTimes = [
    "5:00 PM - 6:00 PM",
    "6:00 PM - 7:00 PM",
    "7:00 PM - 8:00 PM",
  ];

  const kidsTimes = ["6:00 PM - 7:00 PM"];

  const handleBatchChange = (e) => {
    setBatch(e.target.value);
    setTimingType("");
    setFormData((prev) => ({
      ...prev,
      timing: "",
      parentName: "",
      parentContact: "",
    }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!batch) {
      toast.error("Please select a batch");
      return;
    }

    if (!timingType) {
      toast.error("Please select timing type");
      return;
    }

    if (!formData.timing) {
      toast.error("Please select a time slot");
      return;
    }

    if (!membership) {
      toast.error("Please select a membership plan");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Phone validation - must be exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.contact.trim())) {
      toast.error("Contact number must be exactly 10 digits");
      return;
    }

    // Parent contact validation
    if (batch === "Kids Batch" && formData.parentContact.trim() && !phoneRegex.test(formData.parentContact.trim())) {
      toast.error("Parent contact number must be exactly 10 digits");
      return;
    }

    try {
      setLoading(true);

      const isKids = batch === "Kids Batch";

      const memberData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        contact: formData.contact.trim(),
        mobile: formData.contact.trim(),
        address: formData.address.trim(),
        batch,
        timingType,
        timing: formData.timing,
        membership,
        transactionType: formData.transactionType,
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        status: "Active",
        createdAt: new Date().toISOString(),
      };

      if (isKids) {
        memberData.parentName = formData.parentName.trim();
        memberData.parentContact = formData.parentContact.trim();
      }

      let res;
      if (isKids) {
        res = await batchMembersAPI.create(memberData);
      } else {
        res = await membersAPI.create(memberData);
      }

      toast.success("Member added successfully!");

      if (onMemberAdded) {
        onMemberAdded(res);
      }

      window.dispatchEvent(new Event("membersUpdated"));

      if (closeForm) {
        closeForm();
      }
    } catch (error) {
      console.error("Add Member Error:", error);
      toast.error("Failed to add member to database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay select-none">
      <div className="admin-modal large-admin-modal">
        
        {/* Header matching Experts Modal */}
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Add New Member</h3>
          <button type="button" className="admin-modal-close cursor-pointer" onClick={closeForm}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Scrollable Form Fields container */}
          <div className="admin-modal-body">
            <div className="large-admin-modal-form">
              
              <div className="admin-form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="admin-form-control"
                  placeholder="Enter member name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="admin-form-control"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Contact Number *</label>
                <input
                  type="tel"
                  name="contact"
                  className="admin-form-control"
                  placeholder="Enter 10-digit contact number"
                  value={formData.contact}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData((prev) => ({ ...prev, contact: val, mobile: val }));
                  }}
                  maxLength={10}
                  minLength={10}
                  inputMode="numeric"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  className="admin-form-control"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Select Batch *</label>
                <select 
                  className="admin-form-control" 
                  value={batch} 
                  onChange={handleBatchChange} 
                  required
                >
                  <option value="">Choose Batch</option>
                  <option value="Weight Loss & Fitness">Weight Loss & Fitness</option>
                  <option value="Athlete Batch">Athlete Batch</option>
                  <option value="Special Ladies Batch">Special Ladies Batch</option>
                  <option value="Intermediate Calisthenics">Intermediate Calisthenics</option>
                  <option value="Kids Batch">Kids Batch</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Select Membership *</label>
                <select
                  className="admin-form-control"
                  value={membership}
                  onChange={(e) => setMembership(e.target.value)}
                  required
                >
                  <option value="">Choose Membership</option>
                  <option value="Weekly Plan - ₹2,500">Weekly Plan - ₹2,500</option>
                  <option value="15 Days - ₹4,000">15 Days - ₹4,000</option>
                  <option value="Monthly - ₹6,000">Monthly - ₹6,000</option>
                  <option value="3 Months - ₹12,000">3 Months - ₹12,000</option>
                  <option value="6 Months - ₹18,000">6 Months - ₹18,000</option>
                  <option value="Yearly Membership - ₹24,000">Yearly - ₹24,000</option>
                  <option value="Kids Yearly - ₹30,000">Kids Yearly - ₹30,000</option>
                </select>
              </div>

              {/* Conditional fields automatically align on grid rows */}
              {batch === "Kids Batch" && (
                <>
                  <div className="admin-form-group">
                    <label>Parent Name *</label>
                    <input
                      type="text"
                      name="parentName"
                      className="admin-form-control"
                      placeholder="Enter parent name"
                      value={formData.parentName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Parent Contact Number *</label>
                    <input
                      type="tel"
                      name="parentContact"
                      className="admin-form-control"
                      placeholder="Enter 10-digit parent contact"
                      value={formData.parentContact}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setFormData((prev) => ({ ...prev, parentContact: val }));
                      }}
                      maxLength={10}
                      minLength={10}
                      inputMode="numeric"
                      required
                    />
                  </div>
                </>
              )}

              {batch && (
                <div className="admin-form-group">
                  <label>Select Timing Type *</label>
                  <select
                    className="admin-form-control"
                    value={timingType}
                    onChange={(e) => {
                      setTimingType(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        timing: "",
                      }));
                    }}
                    required
                  >
                    <option value="">Choose Morning / Evening</option>
                    {batch !== "Kids Batch" && <option value="Morning">Morning</option>}
                    <option value="Evening">Evening</option>
                  </select>
                </div>
              )}

              {timingType && (
                <div className="admin-form-group">
                  <label>Select Timing *</label>
                  <select
                    name="timing"
                    className="admin-form-control"
                    value={formData.timing}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose Time Slot</option>
                    {batch === "Kids Batch" &&
                      kidsTimes.map((time, index) => (
                        <option key={index} value={time}>
                          {time}
                        </option>
                      ))}
                    {batch !== "Kids Batch" &&
                      timingType === "Morning" &&
                      morningTimes.map((time, index) => (
                        <option key={index} value={time}>
                          {time}
                        </option>
                      ))}
                    {batch !== "Kids Batch" &&
                      timingType === "Evening" &&
                      eveningTimes.map((time, index) => (
                        <option key={index} value={time}>
                          {time}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {membership && (
                <>
                  <div className="admin-form-group">
                    <label>Membership Start Date *</label>
                    <input
                      type="date"
                      className="admin-form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      required
                      style={{ color: '#0f172a' }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Transaction Type *</label>
                    <select
                      name="transactionType"
                      className="admin-form-control"
                      value={formData.transactionType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose Payment Type</option>
                      <option value="UPI Payment">UPI Payment</option>
                      <option value="Cash Payment">Cash Payment</option>
                    </select>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Fixed Footer matching Experts Modal */}
          <div className="admin-modal-footer">
            <button
              type="button"
              className="admin-btn admin-btn-secondary cursor-pointer"
              onClick={closeForm}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="admin-btn admin-btn-primary cursor-pointer" 
              disabled={loading}
            >
              {loading ? "Adding Member..." : "Add Member"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddMemberForm;
