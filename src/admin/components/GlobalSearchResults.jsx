import React from "react";
import "../../style/Admin/GlobalSearchResults.css";

function GlobalSearchResults({
  searchText = "",
  results = [],
  onResultClick,
}) {
  const trimmedSearchText = searchText.trim();

  // Do not show the results box when search is empty
  if (!trimmedSearchText) {
    return null;
  }

  const safeResults = Array.isArray(results) ? results : [];

  const handleResultClick = (item) => {
    if (typeof onResultClick === "function") {
      onResultClick(item);
    }
  };

  const getTabLabel = (tab) => {
    const tabLabels = {
      members: "Members",
      reports: "Reports",
      experts: "Experts",
      events: "Events",
      enquiries: "Enquiries",
      batches: "Batches",
      transformations: "Transformations",
      membership: "Membership",
      overview: "Overview",
      about: "About",
      settings: "Settings",
    };

    return tabLabels[tab] || tab || "Unknown Section";
  };

  return (
    <div className="global-search-box select-none">
      {safeResults.length === 0 ? (
        <div className="global-search-empty">
          <span className="empty-icon">🔍</span>
          <p>
            No result found for <strong>"{trimmedSearchText}"</strong>
          </p>
          <small>Try searching with a different name, email, or keyword.</small>
        </div>
      ) : (
        <>
          <div className="global-search-header">
            <span>
              {safeResults.length}{" "}
              {safeResults.length === 1 ? "result" : "results"} found
            </span>
            <small>Click a result to open its section</small>
          </div>

          <div className="global-search-list">
            {safeResults.slice(0, 12).map((item, index) => {
              const title =
                item?._displayTitle ||
                item?.name ||
                item?.title ||
                item?.email ||
                "Untitled Record";

              const subtitle =
                item?._displaySubtitle ||
                item?.email ||
                item?.specialization ||
                item?.batch ||
                item?.membership ||
                item?.timing ||
                item?.contact ||
                item?.mobile ||
                item?.phone ||
                "";

              const tabLabel = getTabLabel(item?.tab);

              return (
                <button
                  type="button"
                  key={item._id || index}
                  className="global-search-item"
                  onClick={() => handleResultClick(item)}
                >
                  <div className="item-icon-box">{item.icon || "🔍"}</div>
                  <div className="item-details">
                    <h4>{title}</h4>
                    {subtitle && <p>{subtitle}</p>}
                  </div>
                  <span className="item-badge">{tabLabel}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default GlobalSearchResults;
