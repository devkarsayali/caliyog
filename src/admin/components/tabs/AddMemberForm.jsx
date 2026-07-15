import React, { useState } from "react";
import logo from "../../../assets/CaliYog-Logo.png";
import { membersAPI, batchMembersAPI } from "../../../api/dataAPI";
import toast from 'react-hot-toast';
import "../../../style/JoinForm.css";

function AddMemberForm({ closeForm, onMemberAdded }) {
  const [batch, setBatch] = useState("");
  const [timingType, setTimingType] = useState("");
  const [membership, setMembership] = useState("");
  const [loading, setLoading] = useState(false);

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
        startDate: new Date().toISOString(),
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
    <div className="modal-overlay select-none">
      <div className="join-modal add-member-modal">
        <button className="close-btn cursor-pointer" onClick={closeForm}>
          ✕
        </button>

        <div className="join-header">
          <img src={logo} alt="CaliYog Logo" className="join-logo" />
          <h2>Add New Member</h2>
          <p>Add a new member to CaliYog Fitness Club</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter member name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Number *</label>
            <input
              type="tel"
              name="contact"
              placeholder="Enter contact number"
              value={formData.contact}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Address *</label>
            <input
              type="text"
              name="address"
              placeholder="Enter address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Select Batch *</label>
            <select value={batch} onChange={handleBatchChange} required>
              <option value="">Choose Batch</option>
              <option value="Weight Loss & Fitness">Weight Loss & Fitness</option>
              <option value="Athlete Batch">Athlete Batch</option>
              <option value="Special Ladies Batch">Special Ladies Batch</option>
              <option value="Intermediate Calisthenics">
                Intermediate Calisthenics
              </option>
              <option value="Kids Batch">Kids Batch</option>
            </select>
          </div>

          {batch === "Kids Batch" && (
            <>
              <div className="form-group">
                <label>Parent Name *</label>
                <input
                  type="text"
                  name="parentName"
                  placeholder="Enter parent name"
                  value={formData.parentName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Parent Contact Number *</label>
                <input
                  type="tel"
                  name="parentContact"
                  placeholder="Enter parent contact number"
                  value={formData.parentContact}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {batch && (
            <div className="form-group">
              <label>Select Timing Type *</label>
              <select
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
            <div className="form-group">
              <label>Select Timing *</label>
              <select
                name="timing"
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

          <div className="form-group">
            <label>Select Membership *</label>
            <select
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
              <option value="Yearly Membership - ₹24,000">
                Yearly - ₹24,000
              </option>
              <option value="Kids Yearly - ₹30,000">
                Kids Yearly - ₹30,000
              </option>
            </select>
          </div>

          {membership && (
            <div className="form-group">
              <label>Transaction Type *</label>
              <select
                name="transactionType"
                value={formData.transactionType}
                onChange={handleChange}
                required
              >
                <option value="">Choose Payment Type</option>
                <option value="UPI Payment">UPI Payment</option>
                <option value="Cash Payment">Cash Payment</option>
              </select>
            </div>
          )}

          <button type="submit" className="submit-btn cursor-pointer" disabled={loading}>
            {loading ? "Adding Member..." : "Add Member"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddMemberForm;
