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
    const m = membership.toLowerCase();
    if (m.includes("weekly") || m.includes("week")) return 7;
    if (m.includes("15 days") || m.includes("15days") || m.includes("15-day")) return 15;
    if (m.includes("3 month") || m.includes("3month") || m.includes("quarter")) return 90;
    if (m.includes("6 month") || m.includes("6month") || m.includes("half year")) return 180;
    if (m.includes("year") || m.includes("annual")) return 365;
    if (m.includes("month")) return 30;
    return 30;
  };

  const getRemainingInfo = (member) => {
    const rawDate = member.startDate || member.joinedAt || member.createdAt;
    const start = rawDate ? new Date(rawDate) : null;
    const totalDays = getMembershipDays(member.membership || "");

    if (!start || isNaN(start.getTime())) {
      return { days: 0, status: "unknown", endDate: null };
    }

    const end = new Date(start);
    end.setDate(start.getDate() + totalDays);

    const now = new Date();
    // Compare only dates (ignore time)
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    const diffMs = endDate - nowDate;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let status;
    if (days <= 0) status = "expired";
    else if (days <= 7) status = "critical";
    else if (days <= 30) status = "warning";
    else status = "active";

    return { days: Math.max(days, 0), status, endDate: end, totalDays };
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case "expired": return "remaining-badge badge-expired";
      case "critical": return "remaining-badge badge-critical";
      case "warning": return "remaining-badge badge-warning";
      case "unknown": return "remaining-badge badge-unknown";
      default: return "remaining-badge badge-active";
    }
  };

  const renderBadge = (member) => {
    const { days, status } = getRemainingInfo(member);
    const cls = getBadgeClass(status);
    if (status === "expired") return <span className={cls}>Expired</span>;
    if (status === "unknown") return <span className={cls}>No Date</span>;
    if (status === "critical") return <span className={cls}>⚠ {days}d left</span>;
    if (status === "warning") return <span className={cls}>{days}d left</span>;
    return <span className={cls}>{days} days</span>;
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
                  <td>{renderBadge(member)}</td>
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
                  <td>{renderBadge(member)}</td>
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
              {renderBadge(member)}
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
              {renderBadge(member)}
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
