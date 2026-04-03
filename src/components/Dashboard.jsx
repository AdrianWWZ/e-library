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
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    ),
    refresh: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 2v6h-6"></path>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
      </svg>
    ),
    filter: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
      </svg>
    ),
    search: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    ),
    upload: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
    ),
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "4px", // Reduced gap since buttons expand
        padding: "12px 20px",
        borderBottom: "1px solid #333",
        backgroundColor: "#121212", // Match your dark mode background
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Menu - No text animation */}
      <DashButton
        icon={icons.menu}
        label="Menu"
        expandable={false}
        onClick={() => console.log("Menu clicked")}
      />

      {/* Spacer to push Menu slightly away from the action buttons if desired, or just leave gap */}
      <div style={{ width: "8px" }}></div>

      {/* Action Buttons - These will stretch on hover */}
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

      {/* Flexible spacer to push Upload to the far right, or just keep it left. Let's keep it left based on your request */}
      <div style={{ width: "8px" }}></div>

      {/* Upload - Always shows text, no stretch animation */}
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
