import { useState } from "react";
import { supabase } from "../config/supabaseClient";
import { useSettings } from "../context/settings";
import StorageBar from "./StorageBar";

// On/off switch used for settings
const Toggle = ({ label, description, checked, onChange }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        padding: "10px 16px",
        border: "none",
        textAlign: "left",
        cursor: "pointer",
        backgroundColor: hovered ? "var(--hover)" : "transparent",
        color: "var(--text)",
        transition: "background-color 0.2s",
      }}
    >
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontSize: "0.9rem" }}>{label}</span>
        {description && (
          <span
            style={{
              display: "block",
              fontSize: "0.75rem",
              color: "var(--text-faint)",
              marginTop: "2px",
            }}
          >
            {description}
          </span>
        )}
      </span>
      <span
        style={{
          flexShrink: 0,
          width: "34px",
          height: "20px",
          borderRadius: "999px",
          backgroundColor: checked ? "var(--accent)" : "var(--track)",
          border: "1px solid var(--border-strong)",
          position: "relative",
          transition: "background-color 0.2s",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "2px",
            left: checked ? "16px" : "2px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
            transition: "left 0.2s",
          }}
        />
      </span>
    </button>
  );
};

const Divider = () => (
  <div style={{ height: "1px", backgroundColor: "var(--border)" }} />
);

const ProfileMenu = ({ user, books = [], onLoginClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const { showProgress, setShowProgress } = useSettings();

  const handleLogout = async () => {
    setIsOpen(false);
    await supabase.auth.signOut();
  };

  const personIcon = (
    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
      person
    </span>
  );

  return (
    <div style={{ position: "relative", zIndex: 20 }}>
      {/* Invisible overlay to close menu when clicking outside */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 15,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* The Circular Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Account and settings"
        aria-expanded={isOpen}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "1px solid var(--border-strong)",
          backgroundColor: "var(--input-bg)",
          color: "var(--text-strong)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
          transition: "transform 0.2s, box-shadow 0.2s",
          boxShadow: isOpen ? "0 0 0 2px var(--text-strong)" : "none",
          position: "relative",
          zIndex: 20,
        }}
      >
        {personIcon}
      </button>

      {/* The Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 12px)",
            right: "0",
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 24px var(--shadow)",
            borderRadius: "8px",
            width: "250px",
            maxWidth: "calc(100vw - 32px)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            zIndex: 25,
          }}
        >
          {user && (
            <>
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "var(--surface)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.75rem",
                    color: "var(--text-faint)",
                  }}
                >
                  Signed in as
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "var(--text-strong)",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.email}
                </p>
              </div>

              <div style={{ padding: "14px 16px" }}>
                <StorageBar books={books} />
              </div>
              <Divider />
            </>
          )}

          {/* Settings */}
          <Toggle
            label="Show reading progress"
            description="The % badge on book covers"
            checked={showProgress}
            onChange={setShowProgress}
          />
          <Divider />

          {user ? (
            // --- LOGGED IN MENU ---
            <button
              onClick={handleLogout}
              onMouseEnter={() => setHoveredBtn(true)}
              onMouseLeave={() => setHoveredBtn(false)}
              style={{
                padding: "12px 16px",
                textAlign: "left",
                border: "none",
                background: hoveredBtn ? "var(--danger-soft)" : "transparent",
                color: "var(--danger)",
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              Log Out
            </button>
          ) : (
            // --- LOGGED OUT MENU ---
            <button
              onClick={() => {
                setIsOpen(false);
                onLoginClick();
              }}
              onMouseEnter={() => setHoveredBtn(true)}
              onMouseLeave={() => setHoveredBtn(false)}
              style={{
                padding: "12px 16px",
                textAlign: "left",
                border: "none",
                background: hoveredBtn ? "var(--hover)" : "transparent",
                color: "var(--text)",
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              Log In
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
