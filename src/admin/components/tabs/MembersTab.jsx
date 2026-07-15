import React, { useEffect, useState, useCallback } from "react";
import { FiUserPlus } from "react-icons/fi";
import toast from 'react-hot-toast';
import { membersAPI, batchMembersAPI } from "../../../api/dataAPI";
import AddMemberForm from "./AddMemberForm";
import "../../../style/Admin/MembersTab.css";

function MembersTab() {
  const [members, setMembers] = useState([]);
  const [kidsMembers, setKidsMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const isKidsMember = (member) => {
    const batch = String(member.batch || "").toLowerCase();
    const membership = String(member.membership || "").toLowerCase();
    const title = String(member.title || "").toLowerCase();

    return (
      batch.includes("kid") ||
      membership.includes("kid") ||
      title.includes("kid")
    );
  };

  const fetchFromBackend = useCallback(async () => {
    try {
      const [allMembers, batchKids] = await Promise.all([
        membersAPI.getAll(),
        batchMembersAPI.getAll(),
      ]);

      const memberList = allMembers || [];
      const kidsList = batchKids || [];

      const normalMembers = memberList.filter((m) => !isKidsMember(m));
      const kidsFromMembers = memberList.filter((m) => isKidsMember(m));

      setMembers(normalMembers);
      setKidsMembers([...kidsFromMembers, ...kidsList]);
    } catch (error) {
      console.error("Load error:", error);
      toast.error("Failed to load members");
    }
  }, []);

  const handleMemberAdded = (newMember) => {
    fetchFromBackend();
  };

  useEffect(() => {
    fetchFromBackend();

    const refreshMembers = () => {
      fetchFromBackend();
    };

    window.addEventListener("membersUpdated", refreshMembers);
    return () => {
      window.removeEventListener("membersUpdated", refreshMembers);
    };
  }, [fetchFromBackend]);

  const getMembershipDays = (membership = "") => {
    if (membership.includes("Weekly")) return 7;
    if (membership.includes("15 Days")) return 15;
    if (membership.includes("Monthly")) return 30;
    if (membership.includes("3 Months")) return 90;
    if (membership.includes("6 Months")) return 180;
    if (membership.includes("Yearly")) return 365;
    return 30;
  };

  const getRemainingDays = (member) => {
    const start = new Date(member.startDate || member.joinedAt || member.createdAt);
    const totalDays = getMembershipDays(member.membership || "");

    if (isNaN(start.getTime())) return 0;

    const end = new Date(start);
    end.setDate(start.getDate() + totalDays);

    const diff = end - new Date();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  const deleteMember = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;

    try {
      if (type === "kids") {
        await batchMembersAPI.delete(id);
      } else {
        await membersAPI.delete(id);
      }
      toast.success("Member deleted successfully");
      fetchFromBackend();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete member");
    }
  };

  // ==================== DESKTOP TABLE ====================
  const renderMembersTable = () => {
    return (
      <div className="members-table-wrapper">
        <table className="members-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Address</th>
              <th>Batch</th>
              <th>Timing Type</th>
              <th>Timing</th>
              <th>Membership</th>
              <th>Payment</th>
              <th>Start Date</th>
              <th>Remaining</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan="12" className="empty-members">
                  No members found.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member._id || member.id}>
                  <td><strong>{member.name || "-"}</strong></td>
                  <td>{member.email || "-"}</td>
                  <td>{member.contact || member.mobile || "-"}</td>
                  <td>{member.address || "-"}</td>
                  <td>{member.batch || "-"}</td>
                  <td>{member.timingType || "-"}</td>
                  <td>{member.timing || "-"}</td>
                  <td>{member.membership || "-"}</td>
                  <td>{member.transactionType || "-"}</td>
                  <td>{formatDate(member.startDate || member.joinedAt || member.createdAt)}</td>
                  <td>
                    <span className="remaining-badge">
                      {getRemainingDays(member)} days
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="member-delete-btn cursor-pointer"
                      onClick={() => deleteMember(member._id || member.id, "member")}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderKidsTable = () => {
    return (
      <div className="members-table-wrapper">
        <table className="members-table">
          <thead>
            <tr>
              <th>Kid Name</th>
              <th>Parent Name</th>
              <th>Parent Email</th>
              <th>Parent Contact</th>
              <th>Address</th>
              <th>Batch</th>
              <th>Timing Type</th>
              <th>Timing</th>
              <th>Membership</th>
              <th>Payment</th>
              <th>Start Date</th>
              <th>Remaining</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {kidsMembers.length === 0 ? (
              <tr>
                <td colSpan="13" className="empty-members">
                  No kids batch members found.
                </td>
              </tr>
            ) : (
              kidsMembers.map((member) => (
                <tr key={member._id || member.id}>
                  <td><strong>{member.name || "-"}</strong></td>
                  <td>{member.parentName || "-"}</td>
                  <td>{member.parentEmail || member.email || "-"}</td>
                  <td>{member.parentContact || member.contact || "-"}</td>
                  <td>{member.address || "-"}</td>
                  <td>{member.batch || "-"}</td>
                  <td>{member.timingType || "-"}</td>
                  <td>{member.timing || "-"}</td>
                  <td>{member.membership || "-"}</td>
                  <td>{member.transactionType || "-"}</td>
                  <td>{formatDate(member.startDate || member.joinedAt || member.createdAt)}</td>
                  <td>
                    <span className="remaining-badge">
                      {getRemainingDays(member)} days
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="member-delete-btn cursor-pointer"
                      onClick={() => deleteMember(member._id || member.id, "kids")}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // ==================== MOBILE CARDS ====================
  const renderMembersCards = () => {
    if (members.length === 0) {
      return <div className="empty-members">No members found.</div>;
    }

    return (
      <div className="members-cards">
        {members.map((member) => (
          <div className="member-card" key={member._id || member.id}>
            <div className="member-card-header">
              <h3>{member.name || "Unnamed"}</h3>
              <span className="remaining-badge">
                {getRemainingDays(member)} days
              </span>
            </div>

            <div className="member-card-body">
              <div className="member-card-row">
                <span className="member-card-label">Email</span>
                <span className="member-card-value">{member.email || "-"}</span>
              </div>
              <div className="member-card-row">
                <span className="member-card-label">Contact</span>
                <span className="member-card-value">{member.contact || member.mobile || "-"}</span>
              </div>
              <div className="member-card-row">
                <span className="member-card-label">Address</span>
                <span className="member-card-value">{member.address || "-"}</span>
              </div>
              <div className="member-card-row">
                <span className="member-card-label">Batch</span>
                <span className="member-card-value">{member.batch || "-"}</span>
              </div>
              <div className="member-card-row">
                <span className="member-card-label">Timing</span>
                <span className="member-card-value">{member.timingType || "-"} • {member.timing || "-"}</span>
              </div>
              <div className="member-card-row">
                <span className="member-card-label">Membership</span>
                <span className="member-card-value">{member.membership || "-"}</span>
              </div>
              <div className="member-card-row">
                <span className="member-card-label">Payment</span>
                <span className="member-card-value">{member.transactionType || "-"}</span>
              </div>
              <div className="member-card-row">
                <span className="member-card-label">Start Date</span>
                <span className="member-card-value">{formatDate(member.startDate || member.joinedAt || member.createdAt)}</span>
              </div>
            </div>

            <div className="member-card-footer">
              <button
                type="button"
                className="member-delete-btn cursor-pointer"
                onClick={() => deleteMember(member._id || member.id, "member")}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderKidsCards = () => {
    if (kidsMembers.length === 0) {
      return <div className="empty-members">No kids batch members found.</div>;
    }

    return (
      <div className="members-cards">
        {kidsMembers.map((member) => (
          <div className="member-card" key={member._id || member.id}>
            <div className="member-card-header">
              <h3>{member.name || "Unnamed"}</h3>
              <span className="remaining-badge">
                {getRemainingDays(member)} days
              </span>
            </div>

            <div className="member-card-body">
              <div className="member-card-row">
                <span className="member-card-label">Parent Name</span>
                <span className="member-card-value">{member.parentName || "-"}</span>
              </div>
              <div className="member-card-row">
                <span className="member-card-label">Parent Email</span>
                <span className="member-card-value">{member.parentEmail || member.email || "-"}</span>
              </div>
              <div className="member-card-row">
                <span className="member-card-label">Parent Contact</span>
                <span className="member-card-value">{member.parentContact || member.contact || "-"}</span>
              </div>
              <div className="member-card-row">
                <span className="member-card-label">Address</span>
                <span className="member-card-value">{member.address || "-"}</span>
              </div>
              <div className="member-card-row">
                <span className="member-card-label">Batch</span>
                <span className="member-card-value">{member.batch || "-"}</span>
              </div>
              <div className="member-card-row">
                <span className="member-card-label">Timing</span>
                <span className="member-card-value">{member.timingType || "-"} • {member.timing || "-"}</span>
              </div>
              <div className="member-card-row">
                <span className="member-card-label">Membership</span>
                <span className="member-card-value">{member.membership || "-"}</span>
              </div>
              <div className="member-card-row">
                <span className="member-card-label">Payment</span>
                <span className="member-card-value">{member.transactionType || "-"}</span>
              </div>
              <div className="member-card-row">
                <span className="member-card-label">Start Date</span>
                <span className="member-card-value">{formatDate(member.startDate || member.joinedAt || member.createdAt)}</span>
              </div>
            </div>

            <div className="member-card-footer">
              <button
                type="button"
                className="member-delete-btn cursor-pointer"
                onClick={() => deleteMember(member._id || member.id, "kids")}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="select-none">
      <button
        type="button"
        className="add-member-btn cursor-pointer"
        onClick={() => setShowAddModal(true)}
      >
        <FiUserPlus /> Add Member
      </button>

      <div className="members-box">
        <h2>All Members ({members.length})</h2>
        <div className="members-desktop-view">{renderMembersTable()}</div>
        <div className="members-mobile-view">{renderMembersCards()}</div>
      </div>

      <div className="members-box">
        <h2>Kids Batch Members ({kidsMembers.length})</h2>
        <div className="members-desktop-view">{renderKidsTable()}</div>
        <div className="members-mobile-view">{renderKidsCards()}</div>
      </div>

      {showAddModal && (
        <AddMemberForm
          closeForm={() => setShowAddModal(false)}
          onMemberAdded={handleMemberAdded}
        />
      )}
    </div>
  );
}

export default MembersTab;
