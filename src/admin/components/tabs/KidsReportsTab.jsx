import React, { useCallback, useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { joinRequestsAPI, membersAPI } from "../../../api/dataAPI";
import "../../../style/Admin/ReportsTab.css";

function KidsReportsTab() {
  const [kidsRequests, setKidsRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const value = useCallback((...items) => {
    const found = items.find(
      (item) =>
        item !== undefined &&
        item !== null &&
        String(item).trim() !== ""
    );
    return found || "-";
  }, []);

  const isKidsRequest = useCallback(
    (item) => {
      const batch = String(value(item.batch, item.batchName, "")).toLowerCase();
      const membership = String(item.membership || "").toLowerCase();
      const type = String(value(item.type, item.memberType, "")).toLowerCase();

      return (
        batch.includes("kid") ||
        membership.includes("kid") ||
        type.includes("kid")
      );
    },
    [value]
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await joinRequestsAPI.getAll();
      const requests = data || [];
      const kids = requests.filter((item) => isKidsRequest(item));
      setKidsRequests(kids);
    } catch (error) {
      console.error("Kids Reports Load Error:", error);
      toast.error("Failed to load kids reports");
      setKidsRequests([]);
    } finally {
      setLoading(false);
    }
  }, [isKidsRequest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addToMember = async (id) => {
    if (!id) {
      toast.error("Request ID not found");
      return;
    }

    try {
      const request = kidsRequests.find(r => r._id === id);
      if (!request) {
        toast.error("Request data not found");
        return;
      }

      await membersAPI.create({
        name: value(request.name, request.kidName, request.childName),
        parentName: value(request.parentName, request.fatherName, request.guardianName),
        email: value(request.parentEmail, request.email),
        contact: value(request.parentContact, request.contact, request.mobile, request.phone, request.parentMobile),
        address: value(request.address, request.fullAddress, request.location, request.userAddress),
        batch: value(request.batch, request.batchName, request.selectedBatch, request.batchType),
        timingType: value(request.timingType, request.timeType, request.trainingType, request.sessionType),
        timing: value(request.timing, request.time, request.batchTime, request.selectedTiming),
        membership: value(request.membership, request.membershipPlan, request.plan, request.packageName),
        transactionType: value(request.transactionType, request.payment, request.paymentMode, request.paymentType, request.paymentMethod),
        active: true,
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        joinedAt: new Date().toISOString()
      });

      await joinRequestsAPI.update(id, { status: "Added to Member" });
      toast.success("Kid Added Successfully");
      await loadData();
      window.dispatchEvent(new Event("membersUpdated"));
    } catch (error) {
      console.error("Add Kid Error:", error);
      toast.error("Failed to add kid");
    }
  };

  const rejectRequest = async (id) => {
    if (!id) {
      toast.error("Request ID not found");
      return;
    }

    try {
      await joinRequestsAPI.update(id, { status: "Rejected" });
      toast.success("Request Rejected");
      await loadData();
    } catch (error) {
      console.error("Reject Error:", error);
      toast.error("Failed to reject request");
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  const getStatusClass = (status) => {
    if (status === "Added to Member") return "status-checked";
    if (status === "Rejected") return "status-rejected";
    return "status-new";
  };

  return (
    <div className="reports-container select-none">
      <div className="report-box">
        <h2>Kids Batch Requests ({kidsRequests.length})</h2>

        {/* ============= DESKTOP TABLE VIEW ============= */}
        <div className="reports-desktop-view">
          <div className="report-table-wrapper">
            <table className="report-table">
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
                  <th>Status</th>
                  <th>Submitted On</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="13" className="empty-report">
                      Loading Kids Requests...
                    </td>
                  </tr>
                ) : kidsRequests.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="empty-report">
                      No Kids Batch Requests Found
                    </td>
                  </tr>
                ) : (
                  kidsRequests.map((item) => (
                    <tr key={item._id || item.id}>
                      <td>
                        <strong>
                          {value(item.name, item.kidName, item.childName)}
                        </strong>
                      </td>
                      <td>
                        {value(
                          item.parentName,
                          item.fatherName,
                          item.guardianName
                        )}
                      </td>
                      <td>{value(item.parentEmail, item.email)}</td>
                      <td>
                        {value(
                          item.parentContact,
                          item.contact,
                          item.mobile,
                          item.phone,
                          item.parentMobile
                        )}
                      </td>
                      <td>
                        {value(
                          item.address,
                          item.fullAddress,
                          item.location,
                          item.userAddress
                        )}
                      </td>
                      <td>
                        {value(
                          item.batch,
                          item.batchName,
                          item.selectedBatch,
                          item.batchType
                        )}
                      </td>
                      <td>
                        {value(
                          item.timingType,
                          item.timeType,
                          item.trainingType,
                          item.sessionType
                        )}
                      </td>
                      <td>
                        {value(
                          item.timing,
                          item.time,
                          item.batchTime,
                          item.selectedTiming
                        )}
                      </td>
                      <td>
                        <span className="membership-tag">
                          {value(
                            item.membership,
                            item.membershipPlan,
                            item.plan,
                            item.packageName
                          )}
                        </span>
                      </td>
                      <td>
                        {value(
                          item.transactionType,
                          item.payment,
                          item.paymentMode,
                          item.paymentType,
                          item.paymentMethod
                        )}
                      </td>
                      <td>
                        <span className={getStatusClass(item.status)}>
                          {value(item.status, "Pending")}
                        </span>
                      </td>
                      <td>
                        {formatDate(
                          item.createdAt || item.submittedOn || item.date
                        )}
                      </td>
                      <td>
                        <div className="report-action-box">
                          <button
                            type="button"
                            className="member-btn cursor-pointer"
                            disabled={
                              item.status === "Added to Member" ||
                              item.status === "Rejected"
                            }
                            onClick={() => addToMember(item._id || item.id)}
                          >
                            {item.status === "Added to Member"
                              ? "Kid Added"
                              : "Add Kid"}
                          </button>

                          <button
                            type="button"
                            className="checked-btn cursor-pointer"
                            disabled={
                              item.status === "Rejected" ||
                              item.status === "Added to Member"
                            }
                            onClick={() => rejectRequest(item._id || item.id)}
                          >
                            {item.status === "Rejected" ? "Rejected" : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============= MOBILE CARDS VIEW ============= */}
        {kidsRequests.length > 0 && !loading && (
          <div className="reports-mobile-view">
            <div className="reports-cards">
              {kidsRequests.map((item) => (
                <div className="report-card-item" key={item._id || item.id}>
                  <div className="report-card-header">
                    <h3>
                      {value(item.name, item.kidName, item.childName)}
                    </h3>
                    <span className={getStatusClass(item.status)}>
                      {value(item.status, "Pending")}
                    </span>
                  </div>

                  <div className="report-card-body">
                    <div className="report-card-row">
                      <span className="report-card-label">👨‍👩‍👦 Parent Name</span>
                      <span className="report-card-value">
                        {value(
                          item.parentName,
                          item.fatherName,
                          item.guardianName
                        )}
                      </span>
                    </div>
                    <div className="report-card-row">
                      <span className="report-card-label">📧 Parent Email</span>
                      <span className="report-card-value">
                        {value(item.parentEmail, item.email)}
                      </span>
                    </div>
                    <div className="report-card-row">
                      <span className="report-card-label">📞 Parent Contact</span>
                      <span className="report-card-value">
                        {value(
                          item.parentContact,
                          item.contact,
                          item.mobile,
                          item.phone,
                          item.parentMobile
                        )}
                      </span>
                    </div>
                    <div className="report-card-row">
                      <span className="report-card-label">📍 Address</span>
                      <span className="report-card-value">
                        {value(
                          item.address,
                          item.fullAddress,
                          item.location,
                          item.userAddress
                        )}
                      </span>
                    </div>
                    <div className="report-card-row">
                      <span className="report-card-label">🏋️ Batch</span>
                      <span className="report-card-value">
                        {value(
                          item.batch,
                          item.batchName,
                          item.selectedBatch,
                          item.batchType
                        )}
                      </span>
                    </div>
                    <div className="report-card-row">
                      <span className="report-card-label">⏰ Timing</span>
                      <span className="report-card-value">
                        {value(
                          item.timingType,
                          item.timeType,
                          item.trainingType,
                          item.sessionType
                        )}{" "}
                        •{" "}
                        {value(
                          item.timing,
                          item.time,
                          item.batchTime,
                          item.selectedTiming
                        )}
                      </span>
                    </div>
                    <div className="report-card-row">
                      <span className="report-card-label">💳 Membership</span>
                      <span className="report-card-value">
                        <span className="membership-tag">
                          {value(
                            item.membership,
                            item.membershipPlan,
                            item.plan,
                            item.packageName
                          )}
                        </span>
                      </span>
                    </div>
                    <div className="report-card-row">
                      <span className="report-card-label">💰 Payment</span>
                      <span className="report-card-value">
                        {value(
                          item.transactionType,
                          item.payment,
                          item.paymentMode,
                          item.paymentType,
                          item.paymentMethod
                        )}
                      </span>
                    </div>
                    <div className="report-card-row">
                      <span className="report-card-label">📅 Submitted</span>
                      <span className="report-card-value">
                        {formatDate(
                          item.createdAt || item.submittedOn || item.date
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="report-card-footer">
                    <button
                      type="button"
                      className="member-btn cursor-pointer"
                      disabled={
                        item.status === "Added to Member" ||
                        item.status === "Rejected"
                      }
                      onClick={() => addToMember(item._id || item.id)}
                    >
                      {item.status === "Added to Member"
                        ? "✓ Kid Added"
                        : "✓ Add Kid"}
                    </button>
                    <button
                      type="button"
                      className="checked-btn cursor-pointer"
                      disabled={
                        item.status === "Rejected" ||
                        item.status === "Added to Member"
                      }
                      onClick={() => rejectRequest(item._id || item.id)}
                    >
                      {item.status === "Rejected" ? "✗ Rejected" : "✗ Reject"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default KidsReportsTab;
