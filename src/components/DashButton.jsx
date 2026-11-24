import { useState } from "react";

const DashButton = ({
  icon,
  label,
  onClick,
  expandable = true,
  alwaysShowLabel = false,
  disabled = false,
  active = false, // highlights the button (e.g. filter panel open)
  badge = false, // small dot in the corner (e.g. filters applied)
  title,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = alwaysShowLabel || (expandable && isHovered);

  let color = "var(--text-muted)";
  if (disabled) color = "var(--text-disabled)";
  else if (active) color = "var(--accent)";
  else if (isHovered) color = "var(--text-strong)";

  let backgroundColor = "transparent";
  if (!disabled && active) backgroundColor = "var(--accent-soft)";
  else if (!disabled && isHovered) backgroundColor = "var(--hover)";

  return (
    <button
      onClick={disabled ? null : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title ?? (expandable ? "" : label)}
      aria-label={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor,
        color,
        border: "none",
        borderRadius: "6px",
        padding: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background-color 0.2s ease, color 0.2s ease",
        position: "relative",
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

      {badge && (
        <span
          style={{
            position: "absolute",
            top: "6px",
            left: "22px",
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            backgroundColor: "var(--accent)",
            border: "1.5px solid var(--bg)",
          }}
        />
      )}

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
