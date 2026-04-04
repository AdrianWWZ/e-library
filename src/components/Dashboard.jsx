import React, { useState } from "react";

// Upgraded DashButton with expansion animation logic
const DashButton = ({
  icon,
  label,
  onClick,
  expandable = true,
  alwaysShowLabel = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determine if the text should currently be visible
  const isExpanded = alwaysShowLabel || (expandable && isHovered);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={expandable ? "" : label} // Only show native tooltip if it doesn't expand
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: isHovered ? "#333333" : "transparent", // Borderless, highlight on hover
        color: isHovered ? "#ffffff" : "#a0a0a0",
        border: "none",
        borderRadius: "6px",
        padding: "8px",
        cursor: "pointer",
        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
    >
      {/* Icon Container */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>

      {/* Text Container (The Animation Magic) */}
      {(expandable || alwaysShowLabel) && (
        <div
          style={{
            maxWidth: isExpanded ? "100px" : "0px",
            opacity: isExpanded ? 1 : 0,
            overflow: "hidden",
            transition:
              "max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              paddingLeft: isExpanded ? "8px" : "0px",
              paddingRight: isExpanded ? "4px" : "0px",
              fontSize: "0.85rem",
              fontWeight: "500",
              transition: "padding-left 0.3s ease, padding-right 0.3s ease",
            }}
          >
            {label}
          </span>
        </div>
      )}
    </button>
  );
};

const Dashboard = () => {
  // SVG icons
  const icons = {
    menu: (
      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
        menu
      </span>
    ),
    refresh: (
      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
        refresh
      </span>
    ),
    filter: (
      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
        filter_list
      </span>
    ),
    search: (
      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
        search
      </span>
    ),
    upload: (
      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
        upload
      </span>
    ),
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "4px",
        padding: "12px 20px",
        borderBottom: "1px solid #333",
        backgroundColor: "#121212",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <DashButton
        icon={icons.menu}
        label="Menu"
        expandable={false}
        onClick={() => console.log("Menu clicked")}
      />

      {/* Spacer to push Menu slightly away from the action buttons if desired, or just leave gap */}
      <div style={{ width: "8px" }}></div>

      <DashButton
        icon={icons.refresh}
        label="Refresh"
        onClick={() => console.log("Refresh clicked")}
      />
      <DashButton
        icon={icons.filter}
        label="Filter"
        onClick={() => console.log("Filter clicked")}
      />
      <DashButton
        icon={icons.search}
        label="Search"
        onClick={() => console.log("Search clicked")}
      />
      <DashButton
        icon={icons.upload}
        label="Upload"
        alwaysShowLabel={true}
        onClick={() => console.log("Upload clicked")}
      />
    </div>
  );
};

export default Dashboard;
