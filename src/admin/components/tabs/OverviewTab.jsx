import React, { useEffect, useState } from "react";
import {
  FiUsers,
  FiArrowRight,
  FiMail,
  FiUserPlus,
} from "react-icons/fi";
import { 
  expertsAPI, membersAPI, batchMembersAPI, contactsAPI 
} from "../../../api/dataAPI";

import "../../../style/Admin/OverviewTab.css";

function OverviewTab({ setActiveTab }) {
  const [expertsCount, setExpertsCount] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [batchMembersCount, setBatchMembersCount] = useState(0);
  const [enquiriesCount, setEnquiriesCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          expertsList,
          membersList,
          batchMembersList,
          enquiriesList,
        ] = await Promise.all([
          expertsAPI.getAll(),
          membersAPI.getAll(),
          batchMembersAPI.getAll(),
          contactsAPI.getAll(),
        ]);

        setExpertsCount(expertsList ? expertsList.length : 0);
        setMembersCount(membersList ? membersList.length : 0);
        setBatchMembersCount(batchMembersList ? batchMembersList.length : 0);
        setEnquiriesCount(enquiriesList ? enquiriesList.length : 0);
      } catch (error) {
        console.error("Overview Load Error:", error);
      }
    };

    loadData();
  }, []);

  return (
    <div className="admin-content-window select-none">
      <section className="admin-stats-grid">
        <StatCard title="Total Experts" number={expertsCount} text="Professional trainers added" icon={<FiUsers />} />
        <StatCard title="Active Members" number={membersCount} text="Users added as members" icon={<FiUserPlus />} />
        <StatCard title="Batch Members" number={batchMembersCount} text="Users added to batches" icon={<FiUsers />} />
        <StatCard title="Enquiries" number={enquiriesCount} text="Contact form messages" icon={<FiMail />} />
      </section>

      <div className="admin-summary-panel">
        <div className="admin-summary-header">
          <div>
            <h2>Dashboard Summary</h2>
            <p>Quickly manage all important CaliYog admin sections.</p>
          </div>
        </div>

        <div className="summary-grid">
          <SummaryRow title="Experts" count={`${expertsCount} Total Records`} tab="experts" setActiveTab={setActiveTab} />
          <SummaryRow title="Members" count={`${membersCount} Active Members`} tab="members" setActiveTab={setActiveTab} />
          <SummaryRow title="Batch Members" count={`${batchMembersCount} Batch Students`} tab="members" setActiveTab={setActiveTab} />
          <SummaryRow title="Enquiries" count={`${enquiriesCount} Contact Messages`} tab="enquiries" setActiveTab={setActiveTab} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, number, text, icon }) {
  return (
    <div className="stat-card-admin">
      <div className="stat-info-admin">
        <h3>{title}</h3>
        <div className="stat-number">{number}</div>
        <p>{text}</p>
      </div>

      <div className="stat-icon-admin">{icon}</div>
    </div>
  );
}

function SummaryRow({ title, count, tab, setActiveTab }) {
  return (
    <div className="summary-row">
      <div>
        <h3>{title}</h3>
        <p>{count}</p>
      </div>

      <button className="cursor-pointer" onClick={() => setActiveTab && setActiveTab(tab)}>
        Manage <FiArrowRight />
      </button>
    </div>
  );
}

export default OverviewTab;