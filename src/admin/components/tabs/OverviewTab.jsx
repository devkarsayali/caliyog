import React, { useEffect, useState } from "react";
import {
  FiUsers,
  FiArrowRight,
  FiMail,
  FiCalendar,
  FiGrid,
  FiUserPlus,
  FiPlusCircle,
  FiTrendingUp,
  FiInfo,
} from "react-icons/fi";
import { 
  expertsAPI, contactsAPI, batchesAPI, eventsAPI, transformationsAPI, aboutAPI, membershipsAPI
} from "../../../api/dataAPI";

import "../../../style/Admin/OverviewTab.css";

function OverviewTab({ setActiveTab }) {
  const [expertsCount, setExpertsCount] = useState(0);
  const [enquiriesCount, setEnquiriesCount] = useState(0);
  const [batchesCount, setBatchesCount] = useState(0);
  const [followupsCount, setFollowupsCount] = useState(0);
  const [transformationsCount, setTransformationsCount] = useState(0);
  const [aboutCount, setAboutCount] = useState(0);
  const [membershipsCount, setMembershipsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [enquiriesData, setEnquiriesData] = useState([]);

  // Helper to compile the last 6 months chronologically
  const getLast6Months = () => {
    const months = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        name: monthNames[d.getMonth()],
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        count: 0
      });
    }
    return months;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          expertsList,
          enquiriesList,
          batchesList,
          eventsList,
          transformationsList,
          aboutList,
          membershipsList,
        ] = await Promise.all([
          expertsAPI.getAll(),
          contactsAPI.getAll(),
          batchesAPI.getAll(),
          eventsAPI.getAll(),
          transformationsAPI.getAll(),
          aboutAPI.getAll(),
          membershipsAPI.getAll(),
        ]);

        setExpertsCount(expertsList ? expertsList.length : 0);
        setEnquiriesCount(enquiriesList ? enquiriesList.length : 0);
        setBatchesCount(batchesList ? batchesList.length : 0);
        const fList = enquiriesList ? enquiriesList.filter(item => item.followupDate || item.followupNote) : [];
        setFollowupsCount(fList.length);
        setTransformationsCount(transformationsList ? transformationsList.length : 0);
        setAboutCount(aboutList ? aboutList.length : 0);
        setMembershipsCount(membershipsList ? membershipsList.length : 0);
        setEventsCount(eventsList ? eventsList.length : 0);

        // Group enquiries dynamically
        const monthlyEnquiries = getLast6Months();
        if (enquiriesList) {
          enquiriesList.forEach(item => {
            const dateValue = item.createdAt || item.date || item.submittedOn;
            if (dateValue) {
              const date = new Date(dateValue);
              if (!isNaN(date.getTime())) {
                const itemMonth = date.getMonth();
                const itemYear = date.getFullYear();
                const slot = monthlyEnquiries.find(
                  m => m.monthIndex === itemMonth && m.year === itemYear
                );
                if (slot) {
                  slot.count += 1;
                }
              }
            }
          });
        }
        setEnquiriesData(monthlyEnquiries);

        // Compile real-time activities log
        const activities = [];
        if (expertsList) {
          expertsList.forEach(item => {
            activities.push({
              activity: `Trainer Added: ${item.name}`,
              module: "Experts",
              date: item.createdAt || new Date(2026, 6, 16, 9, 30).toISOString(),
            });
          });
        }
        if (batchesList) {
          batchesList.forEach(item => {
            activities.push({
              activity: `Batch Program Configured: ${item.title}`,
              module: "Batches",
              date: item.createdAt || new Date(2026, 6, 15, 14, 0).toISOString(),
            });
          });
        }
        if (eventsList) {
          eventsList.forEach(item => {
            activities.push({
              activity: `Event Organized: ${item.title}`,
              module: "Events",
              date: item.createdAt || item.date || new Date(2026, 6, 17, 10, 15).toISOString(),
            });
          });
        }
        if (transformationsList) {
          transformationsList.forEach(item => {
            activities.push({
              activity: `Transformation Story Published: ${item.name}`,
              module: "Transformations",
              date: item.createdAt || new Date(2026, 6, 14, 11, 45).toISOString(),
            });
          });
        }
        if (membershipsList) {
          membershipsList.forEach(item => {
            activities.push({
              activity: `Membership Plan Created: ${item.title}`,
              module: "Memberships",
              date: item.createdAt || new Date(2026, 6, 12, 16, 20).toISOString(),
            });
          });
        }
        if (enquiriesList) {
          enquiriesList.forEach(item => {
            activities.push({
              activity: `New Enquiry from: ${item.name}`,
              module: "Enquiries",
              date: item.createdAt || new Date(2026, 6, 17, 11, 0).toISOString(),
            });
          });
        }

        // Sort descending by Date
        const sorted = activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
        setRecentActivities(sorted);
      } catch (error) {
        console.error("Overview Load Error:", error);
      }
    };

    loadData();
  }, []);

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return isoString;
    }
  };

  const totalItems = expertsCount + batchesCount + followupsCount + aboutCount + transformationsCount + membershipsCount + eventsCount;
  const circumference = 251.327;

  let cumulativePercent = 0;
  const segments = [
    { label: "Experts", count: expertsCount, color: "#22c55e", tab: "experts" },
    { label: "Batches", count: batchesCount, color: "#3b82f6", tab: "batches" },
    { label: "Follow-ups", count: followupsCount, color: "#eab308", tab: "followups" },
    { label: "Transformations", count: transformationsCount, color: "#a855f7", tab: "transformations" },
    { label: "Memberships", count: membershipsCount, color: "#06b6d4", tab: "membership" },
    { label: "Events", count: eventsCount, color: "#f97316", tab: "events" },
    { label: "About", count: aboutCount, color: "#ec4899", tab: "about" },
  ].map(seg => {
    const percent = totalItems > 0 ? (seg.count / totalItems) * 100 : 0;
    const start = cumulativePercent;
    cumulativePercent += percent;
    return { ...seg, percent, start, end: cumulativePercent };
  });

  const mockBarData = [
    { month: "Jan", total: 35, converted: 18 },
    { month: "Feb", total: 50, converted: 26 },
    { month: "Mar", total: 45, converted: 22 },
    { month: "Apr", total: 70, converted: 42 },
    { month: "May", total: 60, converted: 35 },
    { month: "Jun", total: 85, converted: 58 },
  ];

  return (
    <div className="admin-content-window select-none">
      <section className="admin-stats-grid">
        <StatCard title="Total Experts" number={expertsCount} text="Professional trainers added" icon={<FiUsers />} onClick={() => setActiveTab("experts")} />
        <StatCard title="Total Enquiries" number={enquiriesCount} text="Contact form messages" icon={<FiMail />} onClick={() => setActiveTab("enquiries")} />
        <StatCard title="Total Batches" number={batchesCount} text="Active training programs" icon={<FiGrid />} onClick={() => setActiveTab("batches")} />
        <StatCard title="Total Follow-ups" number={followupsCount} text="Scheduled client activities" icon={<FiCalendar />} onClick={() => setActiveTab("followups")} />
      </section>

      <section className="admin-quick-actions-panel">
        <div className="quick-actions-header">
          <h2>Quick Actions</h2>
          <p>Common tasks and shortcuts for managing your fitness club.</p>
        </div>
        <div className="quick-actions-grid">
          <button type="button" className="quick-action-btn" onClick={() => setActiveTab("experts", "add")}>
            <span className="btn-icon"><FiUserPlus /></span> Add Expert
          </button>
          <button type="button" className="quick-action-btn" onClick={() => setActiveTab("events")}>
            <span className="btn-icon"><FiCalendar /></span> Create Event
          </button>
          <button type="button" className="quick-action-btn" onClick={() => setActiveTab("batches", "add")}>
            <span className="btn-icon"><FiGrid /></span> Add Batch
          </button>
          <button type="button" className="quick-action-btn" onClick={() => setActiveTab("membership", "add")}>
            <span className="btn-icon"><FiPlusCircle /></span> Add Membership Plan
          </button>
          <button type="button" className="quick-action-btn" onClick={() => setActiveTab("transformations", "add")}>
            <span className="btn-icon"><FiTrendingUp /></span> Add Transformation
          </button>
          <button type="button" className="quick-action-btn" onClick={() => setActiveTab("about")}>
            <span className="btn-icon"><FiInfo /></span> Add About
          </button>
        </div>
      </section>

      {/* Charts Section */}
      <section className="admin-charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Content Distribution</h3>
            <p>Visual breakdown of all system content items.</p>
          </div>
          <div className="donut-chart-container">
            <div className="donut-chart-wrapper">
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="10"
                />
                
                {/* Slices */}
                {segments.map((seg) => {
                  if (seg.count === 0) return null;
                  
                  const strokeDasharray = `${(seg.percent / 100) * circumference} ${circumference}`;
                  const offset = -((seg.start / 100) * circumference);

                  return (
                    <circle
                      key={seg.label}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="10"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={offset}
                      transform="rotate(-90 50 50)"
                      className="donut-segment"
                      onMouseEnter={() => setHoveredSegment(seg)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      onClick={() => setActiveTab(seg.tab)}
                    />
                  );
                })}
              </svg>
              <div className="donut-hole">
                <div className="donut-hole-content">
                  <span>{hoveredSegment ? hoveredSegment.count : totalItems}</span>
                  <p>{hoveredSegment ? hoveredSegment.label : "Total Items"}</p>
                </div>
              </div>
            </div>
            <div className="chart-legend">
              {segments.map(seg => (
                <div 
                  key={seg.label} 
                  className={`legend-item cursor-pointer ${hoveredSegment?.label === seg.label ? 'active-legend-hover' : ''}`} 
                  onClick={() => setActiveTab(seg.tab)}
                  onMouseEnter={() => setHoveredSegment(seg)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <span className="legend-color-dot" style={{ backgroundColor: seg.color }}></span>
                  <div className="legend-info">
                    <span className="legend-label">{seg.label}</span>
                    <span className="legend-count">{seg.count} ({Math.round(seg.percent)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Enquiries Received</h3>
            <p>Month-wise breakdown of real contact enquiries.</p>
          </div>
          {(() => {
            const maxCount = Math.max(...enquiriesData.map(d => d.count), 0);
            const maxVal = maxCount > 0 ? Math.ceil(maxCount / 5) * 5 : 5;
            const yAxisTicks = [
              maxVal,
              Math.round(maxVal * 0.75),
              Math.round(maxVal * 0.5),
              Math.round(maxVal * 0.25),
              0
            ];

            return (
              <>
                <div className="bar-chart-container">
                  <div className="bars-y-axis">
                    {yAxisTicks.map((tick, idx) => (
                      <span key={idx}>{tick}</span>
                    ))}
                  </div>
                  <div className="bar-chart-grid">
                    {enquiriesData.map(d => {
                      const heightPercent = maxVal > 0 ? (d.count / maxVal) * 100 : 0;
                      return (
                        <div key={d.name} className="bar-group">
                          <div className="bars-wrapper">
                            <div className="bar-column enquiry-bar" style={{ height: `${heightPercent}%` }}>
                              <span className="bar-tooltip">Enquiries: {d.count}</span>
                            </div>
                          </div>
                          <span className="bar-label">{d.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bar-chart-legend">
                  <div className="legend-item-bar">
                    <span className="legend-color-dot enquiry"></span>
                    <span>Received Enquiries</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </section>

      <div className="admin-recent-activities-panel">
        <div className="admin-recent-activities-header">
          <h2>Recent Activities</h2>
          <p>Latest updates and entries across all admin sections.</p>
        </div>
        <div className="table-responsive-admin">
          <table className="recent-activities-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Module</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.length > 0 ? (
                recentActivities.map((act, index) => (
                  <tr key={index}>
                    <td className="activity-text">{act.activity}</td>
                    <td>
                      <span className={`badge-module module-${act.module.toLowerCase()}`}>
                        {act.module}
                      </span>
                    </td>
                    <td className="activity-date">{formatDate(act.date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-activities">
                    No recent activities recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, number, text, icon, onClick }) {
  return (
    <div className={`stat-card-admin ${onClick ? 'clickable-card' : ''}`} onClick={onClick}>
      <div className="stat-info-admin">
        <h3>{title}</h3>
        <div className="stat-number">{number}</div>
        <p>{text}</p>
      </div>

      <div className="stat-icon-admin">{icon}</div>
    </div>
  );
}

export default OverviewTab;