import { useState } from "react";
import { supabase } from "../config/supabaseClient";

const ProfileMenu = ({ user, onLoginClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(false);

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
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "1px solid #444",
          backgroundColor: "#2a2a2a",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
          transition: "transform 0.2s, box-shadow 0.2s",
          boxShadow: isOpen ? "0 0 0 2px #fff" : "none",
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
            backgroundColor: "#222222",
            border: "1px solid #333333",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            borderRadius: "8px",
            minWidth: "200px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            zIndex: 25,
          }}
        >
          {user ? (
            // --- LOGGED IN MENU ---
            <>
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#1a1a1a",
                  borderBottom: "1px solid #333",
                }}
              >
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>
                  Signed in as
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "#fff",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.email}
                </p>
              </div>

              <button
                onClick={handleLogout}
                onMouseEnter={() => setHoveredBtn(true)}
                onMouseLeave={() => setHoveredBtn(false)}
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  border: "none",
                  background: hoveredBtn ? "#3a1616" : "transparent",
                  color: "#ff4d4f",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
              >
                Log Out
              </button>
            </>
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
                background: hoveredBtn ? "#333" : "transparent",
                color: "#e0e0e0",
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
