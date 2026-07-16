import React, { useState, useEffect } from "react";
import "../../style/Admin/AdminDashboard.css";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import GlobalSearchResults from "../components/GlobalSearchResults";

import OverviewTab from "../components/tabs/OverviewTab";
import AboutTab from "../components/tabs/AboutTab";
import WhyChooseUsTab from "../components/tabs/WhyChooseUsTab";
import BatchesTab from "../components/tabs/BatchesTab";
import MembershipTab from "../components/tabs/MembershipTab";
import TransformationsTab from "../components/tabs/TransformationsTab";
import ExpertsTab from "../components/tabs/ExpertsTab";
import EnquiriesTab from "../components/tabs/EnquiriesTab";
import MembersTab from "../components/tabs/MembersTab";
import SettingsTab from "../components/tabs/SettingsTab";
import EventsManagerTab from "../components/tabs/EventsManagerTab";
import ReportsManagerTab from "../components/tabs/ReportsManagerTab";

import { 
  expertsAPI, eventsAPI, membershipsAPI, joinRequestsAPI, 
  membersAPI, batchMembersAPI, contactsAPI, batchesAPI, transformationsAPI 
} from "../../api/dataAPI";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allSearchData, setAllSearchData] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch search records from serverless MongoDB collections
  const loadSearchData = async () => {
    try {
      const queries = [
        { type: "Experts", tab: "experts", icon: "👨‍🏫", api: expertsAPI },
        { type: "Events", tab: "events", icon: "📅", api: eventsAPI },
        { type: "Membership", tab: "membership", icon: "💳", api: membershipsAPI },
        { type: "Join Requests", tab: "reports", icon: "📋", api: joinRequestsAPI },
        { type: "Members", tab: "members", icon: "👥", api: membersAPI },
        { type: "Batch Members", tab: "members", icon: "🏋️", api: batchMembersAPI },
        { type: "Enquiries", tab: "enquiries", icon: "📩", api: contactsAPI },
        { type: "Batches", tab: "batches", icon: "📚", api: batchesAPI },
        { type: "Transformations", tab: "transformations", icon: "🔥", api: transformationsAPI },
      ];

      const resultsList = await Promise.allSettled(
        queries.map((q) => q.api.getAll())
      );

      const memberEmails = new Set();
      let finalData = [];

      const getSearchableText = (record) => {
        const fields = [
          record.name, record.title, record.email, record.contact,
          record.mobile, record.phone, record.address, record.batch,
          record.timing, record.timingType, record.membership,
          record.transactionType, record.specialization, record.experience,
          record.role, record.designation, record.bio, record.description,
          record.parentName, record.parentEmail, record.parentContact,
          record.status, record.type,
        ];
        return fields.filter(Boolean).join(" ").toLowerCase();
      };

      const getDisplayTitle = (record) => {
        return record.name || record.title || record.email || "Untitled Record";
      };

      const getDisplaySubtitle = (record) => {
        return (
          record.email || record.specialization || record.batch ||
          record.membership || record.timing || record.contact ||
          record.mobile || record.phone || ""
        );
      };

      for (let i = 0; i < resultsList.length; i++) {
        const res = resultsList[i];
        const info = queries[i];

        if (res.status === "fulfilled" && Array.isArray(res.value)) {
          const records = res.value;

          if (info.type === "Members" || info.type === "Batch Members") {
            records.forEach((r) => {
              if (r.email) memberEmails.add(r.email.toLowerCase().trim());
            });
          }

          const formatted = records.map((record) => ({
            ...record,
            type: info.type,
            tab: info.tab,
            icon: info.icon,
            _searchText: getSearchableText(record),
            _displayTitle: getDisplayTitle(record),
            _displaySubtitle: getDisplaySubtitle(record),
            _priority: info.type === "Members" || info.type === "Batch Members" ? 1 : 2,
          }));

          finalData = finalData.concat(formatted);
        }
      }

      // Filter out join requests already approved as members
      finalData = finalData.filter((item) => {
        if (item.type === "Join Requests") {
          const email = (item.email || "").toLowerCase().trim();
          return !memberEmails.has(email);
        }
        return true;
      });

      setAllSearchData(finalData);
    } catch (error) {
      console.error("Global search data sync failed:", error);
    }
  };

  useEffect(() => {
    loadSearchData();
  }, [activeTab]); // Reload index on tab navigate to keep search fresh

  // Filtering Search Results
  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchText.toLowerCase().trim();
    const queryWords = query.split(/\s+/).filter(Boolean);

    const filtered = allSearchData.filter((item) => {
      const text = item._searchText || "";
      if (text.includes(query)) return true;

      if (queryWords.length > 1) {
        return queryWords.some((word) => text.includes(word));
      }

      if (query.length >= 3) {
        let idx = 0;
        for (let i = 0; i < text.length && idx < query.length; i++) {
          if (text[i] === query[idx]) idx++;
        }
        if (idx >= query.length * 0.8) return true;
      }

      return false;
    });

    const sorted = filtered.sort((a, b) => {
      if (a._priority !== b._priority) {
        return (a._priority || 99) - (b._priority || 99);
      }

      const aTitle = (a._displayTitle || "").toLowerCase();
      const bTitle = (b._displayTitle || "").toLowerCase();

      if (aTitle === query) return -1;
      if (bTitle === query) return 1;
      if (aTitle.startsWith(query) && !bTitle.startsWith(query)) return -1;
      if (!aTitle.startsWith(query) && bTitle.startsWith(query)) return 1;

      return 0;
    });

    setSearchResults(sorted.slice(0, 15));
  }, [searchText, allSearchData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (isMobile) setIsSidebarOpen(false);
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const openSettings = () => {
    setActiveTab("settings");
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleSearchResultClick = (item) => {
    setActiveTab(item.tab);
    setSearchText("");
    if (isMobile) setIsSidebarOpen(false);
  };

  const getMainAreaClass = () => {
    if (isMobile) return "admin-main-area mobile";
    return isSidebarOpen
      ? "admin-main-area desktop sidebar-open"
      : "admin-main-area desktop sidebar-closed";
  };

  return (
    <div className="admin-dashboard-wrapper">
      <Topbar
        isMobile={isMobile}
        onToggleSidebar={toggleSidebar}
        onOpenSettings={openSettings}
        searchText={searchText}
        setSearchText={setSearchText}
        setActiveTab={handleTabChange}
        activeTab={activeTab}
      />

      <GlobalSearchResults
        searchText={searchText}
        results={searchResults}
        onResultClick={handleSearchResultClick}
      />

      {isMobile && isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
      />

      <div className={getMainAreaClass()}>
        <main className="admin-content">
          {activeTab === "overview" && (
            <OverviewTab setActiveTab={handleTabChange} />
          )}
          {activeTab === "about" && <AboutTab />}
          {activeTab === "whyChooseUs" && <WhyChooseUsTab />}
          {activeTab === "batches" && <BatchesTab />}
          {activeTab === "membership" && <MembershipTab />}
          {activeTab === "transformations" && <TransformationsTab />}
          {activeTab === "experts" && <ExpertsTab />}
          {activeTab === "events" && <EventsManagerTab />}
          {activeTab === "enquiries" && <EnquiriesTab />}
          {activeTab === "reports" && <ReportsManagerTab />}
          {activeTab === "members" && <MembersTab />}
          {activeTab === "settings" && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;