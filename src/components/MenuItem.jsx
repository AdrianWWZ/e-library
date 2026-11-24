import { useState } from "react";

// One row in a book's ⋮ dropdown menu
const MenuItem = ({
  icon,
  children,
  onClick,
  danger = false,
  busy = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={busy}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        padding: "10px 16px",
        textAlign: "left",
        border: "none",
        color: danger ? "var(--danger)" : "var(--text)",
        fontSize: "0.9rem",
        whiteSpace: "nowrap",
        transition: "background-color 0.2s",
        backgroundColor: isHovered
          ? danger
            ? "var(--danger-soft)"
            : "var(--hover)"
          : "transparent",
        cursor: busy ? "wait" : "pointer",
      }}
    >
      {icon && (
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "18px" }}
        >
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};

export default MenuItem;
