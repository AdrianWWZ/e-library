import { useState } from "react";

const DashButton = ({
  icon,
  label,
  onClick,
  expandable = true,
  alwaysShowLabel = false,
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = alwaysShowLabel || (expandable && isHovered);

  return (
    <button
      onClick={disabled ? null : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={expandable ? "" : label}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: isHovered && !disabled ? "#333333" : "transparent",
        color: disabled ? "#555555" : isHovered ? "#ffffff" : "#a0a0a0",
        border: "none",
        borderRadius: "6px",
        padding: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>

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

export default DashButton;
