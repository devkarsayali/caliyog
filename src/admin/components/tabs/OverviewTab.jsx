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
  const [hoveredLinePoint, setHoveredLinePoint] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [enquiriesData, setEnquiriesData] = useState([]);
  const [followupStatusCounts, setFollowupStatusCounts] = useState({
    overdueCount: 0,
    newCount: 0,
    repliedCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    totalCount: 0,
  });

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

        // Calculate Follow-up status breakdown
        const targetList = fList.length > 0 ? fList : (enquiriesList || []);

        const isOverdueItem = (item) => {
          if (!item.followupDate) return false;
          const status = item.status || "New";
          if (["Completed", "Cancelled", "Canceled", "Cancled"].includes(status)) return false;
          const fDate = new Date(item.followupDate);
          if (isNaN(fDate.getTime())) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const fDateNorm = new Date(fDate.getFullYear(), fDate.getMonth(), fDate.getDate());
          return fDateNorm < today;
        };

        const oC = targetList.filter(item => isOverdueItem(item)).length;
        const nC = targetList.filter(item => (!item.status || item.status === "New") && !isOverdueItem(item)).length;
        const rC = targetList.filter(item => item.status === "Replied" && !isOverdueItem(item)).length;
        const cC = targetList.filter(item => item.status === "Completed").length;
        const xC = targetList.filter(item => item.status === "Cancelled" || item.status === "Canceled" || item.status === "Cancled").length;

        setFollowupStatusCounts({
          overdueCount: oC,
          newCount: nC,
          repliedCount: rC,
          completedCount: cC,
          cancelledCount: xC,
          totalCount: targetList.length,
        });

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

  const totalFollowupItems = followupStatusCounts.totalCount;
  const circumference = 238.761; // 2 * Math.PI * 38

  let cumulativePercent = 0;
  const rawSegments = [
    { label: "Overdue", count: followupStatusCounts.overdueCount || 0, color: "#ff3b81", bgColor: "#fff0f5" },
    { label: "New", count: followupStatusCounts.newCount || 0, color: "#1ea1f7", bgColor: "#e6f5ff" },
    { label: "Replied", count: followupStatusCounts.repliedCount || 0, color: "#ff9d00ff", bgColor: "#fff9e6" },
    { label: "Completed", count: followupStatusCounts.completedCount || 0, color: "#08f7afff", bgColor: "#e6fbf5" },
    { label: "Cancelled", count: followupStatusCounts.cancelledCount || 0, color: "#8b0df1ff", bgColor: "#f6e8ff" },
  ];

  // If all counts are 0 (e.g. no records yet), provide visual fallback slices matching design
  const displaySegmentsData = totalFollowupItems > 0 ? rawSegments : [
    { label: "Overdue", count: 3, color: "#ff3b81", bgColor: "#fff0f5" },
    { label: "New", count: 5, color: "#1ea1f7", bgColor: "#e6f5ff" },
    { label: "Replied", count: 10, color: "#ffb800", bgColor: "#fff9e6" },
    { label: "Completed", count: 8, color: "#14ce96", bgColor: "#e6fbf5" },
    { label: "Cancelled", count: 2, color: "#a040ee", bgColor: "#f6e8ff" },
  ];
  const effectiveTotal = totalFollowupItems > 0 ? totalFollowupItems : 28;

  const segments = displaySegmentsData.map((seg) => {
    const percent = effectiveTotal > 0 ? (seg.count / effectiveTotal) * 100 : 0;
    const start = cumulativePercent;
    cumulativePercent += percent;
    return { ...seg, percent, start, end: cumulativePercent };
  });

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
            <span className="btn-icon"><FiUserPlus /></span> <span className="btn-label">Add Expert</span>
          </button>
          <button type="button" className="quick-action-btn" onClick={() => setActiveTab("events")}>
            <span className="btn-icon"><FiCalendar /></span> <span className="btn-label">Create Event</span>
          </button>
          <button type="button" className="quick-action-btn" onClick={() => setActiveTab("batches", "add")}>
            <span className="btn-icon"><FiGrid /></span> <span className="btn-label">Add Batch</span>
          </button>
          <button type="button" className="quick-action-btn" onClick={() => setActiveTab("membership", "add")}>
            <span className="btn-icon"><FiPlusCircle /></span> <span className="btn-label">Add Membership Plan</span>
          </button>
          <button type="button" className="quick-action-btn" onClick={() => setActiveTab("transformations", "add")}>
            <span className="btn-icon"><FiTrendingUp /></span> <span className="btn-label">Add Transformation</span>
          </button>
          <button type="button" className="quick-action-btn" onClick={() => setActiveTab("about")}>
            <span className="btn-icon"><FiInfo /></span> <span className="btn-label">Add About</span>
          </button>
        </div>
      </section>

      {/* Charts Section */}
      <section className="admin-charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Follow-ups Distribution</h3>
            <p>Visual status breakdown of client follow-up records.</p>
          </div>
          <div className="donut-chart-container flex-column">
            <div className="donut-chart-wrapper">
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="14"
                />

                {/* Slices */}
                {segments.map((seg) => {
                  if (seg.count === 0) return null;

                  const activeCount = segments.filter(s => s.count > 0).length;
                  const gap = activeCount > 1 ? 2.5 : 0;
                  const dashLength = Math.max(0, (seg.percent / 100) * circumference - gap);
                  const strokeDasharray = `${dashLength} ${circumference}`;
                  const offset = -((seg.start / 100) * circumference);

                  return (
                    <circle
                      key={seg.label}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth={hoveredSegment?.label === seg.label ? 16 : 14}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={offset}
                      transform="rotate(-90 50 50)"
                      className="donut-segment"
                      onMouseEnter={() => setHoveredSegment(seg)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      onClick={() => setActiveTab("followups")}
                      style={{ transition: 'stroke-width 0.2s ease, stroke 0.2s ease' }}
                    />
                  );
                })}
              </svg>
              <div className="donut-hole">
                <div className="donut-hole-content">
                  <span>{hoveredSegment ? hoveredSegment.count : (totalFollowupItems > 0 ? totalFollowupItems : effectiveTotal)}</span>
                  <p>{hoveredSegment ? hoveredSegment.label : "Follow-ups"}</p>
                </div>
              </div>
            </div>

            <div className="chart-legend-grid">
              {segments.map(seg => {
                const isHovered = hoveredSegment?.label === seg.label;
                return (
                  <div
                    key={seg.label}
                    className={`legend-pill ${isHovered ? 'active' : ''}`}
                    onClick={() => setActiveTab("followups")}
                    onMouseEnter={() => setHoveredSegment(seg)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    style={{
                      borderColor: isHovered ? seg.color : undefined,
                      backgroundColor: isHovered ? seg.bgColor : undefined,
                    }}
                  >
                    <span className="legend-dot" style={{ backgroundColor: seg.color }}></span>
                    <span className="legend-label-text">{seg.label}</span>
                    <span className="legend-pill-count" style={{ color: seg.color }}>{seg.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Enquiries Trend Line</h3>
            <p>Month-wise trend line of contact enquiries received.</p>
          </div>
          {(() => {
            const maxCount = Math.max(...enquiriesData.map((d) => d.count), 0);
            const maxVal = maxCount > 0 ? Math.ceil(maxCount / 5) * 5 : 5;

            const yAxisTicks = [
              { val: maxVal, y: 25 },
              { val: Math.round(maxVal * 0.75), y: 62 },
              { val: Math.round(maxVal * 0.5), y: 99 },
              { val: Math.round(maxVal * 0.25), y: 136 },
              { val: 0, y: 173 },
            ];

            const points = enquiriesData.map((d, i) => {
              const x = 50 + i * (415 / Math.max(enquiriesData.length - 1, 1));
              const heightRatio = maxVal > 0 ? d.count / maxVal : 0;
              const y = 173 - heightRatio * 148;
              return { x, y, ...d };
            });

            let lineD = "";
            let areaD = "";

            if (points.length > 0) {
              lineD = points.reduce((acc, pt, i) => {
                if (i === 0) return `M ${pt.x} ${pt.y}`;
                const prev = points[i - 1];
                const cx1 = prev.x + (pt.x - prev.x) / 2;
                const cy1 = prev.y;
                const cx2 = prev.x + (pt.x - prev.x) / 2;
                const cy2 = pt.y;
                return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
              }, "");

              areaD = `${lineD} L ${points[points.length - 1].x} 173 L ${points[0].x} 173 Z`;
            }

            return (
              <div className="line-chart-wrapper">
                <div className="line-chart-container">
                  <svg viewBox="0 0 490 215" style={{ width: "100%", height: "100%" }}>
                    <defs>
                      <linearGradient id="enquiryLineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.38" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal grid lines & Y-axis labels */}
                    {yAxisTicks.map((tick, idx) => (
                      <g key={idx}>
                        <line
                          x1="50"
                          y1={tick.y}
                          x2="465"
                          y2={tick.y}
                          stroke="#e2e8f0"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                        <text
                          x="38"
                          y={tick.y + 4}
                          textAnchor="end"
                          fill="#94a3b8"
                          fontSize="11"
                          fontWeight="700"
                        >
                          {tick.val}
                        </text>
                      </g>
                    ))}

                    {/* Area fill under curve */}
                    {areaD && <path d={areaD} fill="url(#enquiryLineGradient)" />}

                    {/* Connecting Smooth Trend Line */}
                    {lineD && (
                      <path
                        d={lineD}
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Data Points and X-Axis Month Labels */}
                    {points.map((pt, i) => {
                      const isHovered = hoveredLinePoint?.name === pt.name;
                      return (
                        <g key={i}>
                          {/* X-axis Month Label */}
                          <text
                            x={pt.x}
                            y="198"
                            textAnchor="middle"
                            fill={isHovered ? "#22c55e" : "#64748b"}
                            fontSize="11"
                            fontWeight="800"
                          >
                            {pt.name}
                          </text>

                          {/* Outer pulse ring on hover */}
                          {isHovered && (
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="10"
                              fill="rgba(34, 197, 94, 0.25)"
                            />
                          )}

                          {/* Data point circle */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? "6.5" : "5"}
                            fill="#22c55e"
                            stroke="#ffffff"
                            strokeWidth="2.5"
                            style={{ transition: "all 0.2s ease" }}
                          />

                          {/* Invisible hover target for smooth interaction */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="16"
                            fill="transparent"
                            style={{ cursor: "pointer" }}
                            onMouseEnter={() => setHoveredLinePoint(pt)}
                            onMouseLeave={() => setHoveredLinePoint(null)}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Floating Tooltip */}
                  {hoveredLinePoint && (
                    <div
                      className="line-tooltip"
                      style={{
                        left: `${(hoveredLinePoint.x / 490) * 100}%`,
                        top: `${(hoveredLinePoint.y / 215) * 100}%`,
                      }}
                    >
                      <span>{hoveredLinePoint.name}</span>
                      <strong>{hoveredLinePoint.count} Enquiries</strong>
                    </div>
                  )}
                </div>

                <div className="bar-chart-legend">
                  <div className="legend-item-bar">
                    <span className="legend-color-dot enquiry"></span>
                    <span>Received Enquiries (Line Trend)</span>
                  </div>
                </div>
              </div>
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