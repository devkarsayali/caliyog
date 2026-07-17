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
  expertsAPI, contactsAPI, batchesAPI, eventsAPI, transformationsAPI, aboutAPI
} from "../../../api/dataAPI";

import "../../../style/Admin/OverviewTab.css";

function OverviewTab({ setActiveTab }) {
  const [expertsCount, setExpertsCount] = useState(0);
  const [enquiriesCount, setEnquiriesCount] = useState(0);
  const [batchesCount, setBatchesCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [transformationsCount, setTransformationsCount] = useState(0);
  const [aboutCount, setAboutCount] = useState(0);

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
        ] = await Promise.all([
          expertsAPI.getAll(),
          contactsAPI.getAll(),
          batchesAPI.getAll(),
          eventsAPI.getAll(),
          transformationsAPI.getAll(),
          aboutAPI.getAll(),
        ]);

        setExpertsCount(expertsList ? expertsList.length : 0);
        setEnquiriesCount(enquiriesList ? enquiriesList.length : 0);
        setBatchesCount(batchesList ? batchesList.length : 0);
        setEventsCount(eventsList ? eventsList.length : 0);
        setTransformationsCount(transformationsList ? transformationsList.length : 0);
        setAboutCount(aboutList ? aboutList.length : 0);
      } catch (error) {
        console.error("Overview Load Error:", error);
      }
    };

    loadData();
  }, []);

  const totalItems = expertsCount + batchesCount + eventsCount + aboutCount + transformationsCount;

  let cumulativePercent = 0;
  const segments = [
    { label: "Experts", count: expertsCount, color: "#22c55e", tab: "experts" },
    { label: "Batches", count: batchesCount, color: "#3b82f6", tab: "batches" },
    { label: "Events", count: eventsCount, color: "#eab308", tab: "events" },
    { label: "Transformations", count: transformationsCount, color: "#a855f7", tab: "transformations" },
    { label: "About", count: aboutCount, color: "#ec4899", tab: "about" },
  ].map(seg => {
    const percent = totalItems > 0 ? Math.round((seg.count / totalItems) * 100) : 0;
    const start = cumulativePercent;
    cumulativePercent += percent;
    return { ...seg, percent, start, end: cumulativePercent };
  });

  const gradientParts = segments
    .filter(seg => seg.percent > 0)
    .map(seg => `${seg.color} ${seg.start}% ${seg.end}%`)
    .join(", ");
  const conicGradient = totalItems > 0 && gradientParts ? `conic-gradient(${gradientParts})` : "#e2e8f0";

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
        <StatCard title="Total Events" number={eventsCount} text="Gym events & programs" icon={<FiCalendar />} onClick={() => setActiveTab("events")} />
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

      {/* Charts Section
      <section className="admin-charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Content Distribution</h3>
            <p>Visual breakdown of all system content items.</p>
          </div>
          <div className="donut-chart-container">
            <div className="donut-chart-wrapper" style={{ background: conicGradient }}>
              <div className="donut-hole">
                <div className="donut-hole-content">
                  <span>{totalItems}</span>
                  <p>Total Items</p>
                </div>
              </div>
            </div>
            <div className="chart-legend">
              {segments.map(seg => (
                <div key={seg.label} className="legend-item cursor-pointer" onClick={() => setActiveTab(seg.tab)}>
                  <span className="legend-color-dot" style={{ backgroundColor: seg.color }}></span>
                  <div className="legend-info">
                    <span className="legend-label">{seg.label}</span>
                    <span className="legend-count">{seg.count} ({seg.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Enquiries Comparison</h3>
            <p>Month-wise comparison of Total vs Converted Enquiries.</p>
          </div>
          <div className="bar-chart-container">
            <div className="bars-y-axis">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
            <div className="bar-chart-grid">
              {mockBarData.map(d => (
                <div key={d.month} className="bar-group">
                  <div className="bars-wrapper">
                    <div className="bar-column total" style={{ height: `${d.total}%` }}>
                      <span className="bar-tooltip">Total: {d.total}</span>
                    </div>
                    <div className="bar-column converted" style={{ height: `${d.converted}%` }}>
                      <span className="bar-tooltip">Converted: {d.converted}</span>
                    </div>
                  </div>
                  <span className="bar-label">{d.month}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bar-chart-legend">
            <div className="legend-item-bar">
              <span className="legend-color-dot total"></span>
              <span>Total Enquiries</span>
            </div>
            <div className="legend-item-bar">
              <span className="legend-color-dot converted"></span>
              <span>Converted Enquiries</span>
            </div>
          </div>
        </div>
      </section>
      */}

      <div className="admin-summary-panel">
        <div className="admin-summary-header">
          <div>
            <h2>Dashboard Summary</h2>
            <p>Quickly manage all important CaliYog admin sections.</p>
          </div>
        </div>

        <div className="summary-grid">
          <SummaryRow title="Experts" count={`${expertsCount} Total Records`} tab="experts" setActiveTab={setActiveTab} />
          <SummaryRow title="Enquiries" count={`${enquiriesCount} Contact Messages`} tab="enquiries" setActiveTab={setActiveTab} />
          <SummaryRow title="Batches" count={`${batchesCount} Total Batches`} tab="batches" setActiveTab={setActiveTab} />
          <SummaryRow title="Events" count={`${eventsCount} Total Events`} tab="events" setActiveTab={setActiveTab} />
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