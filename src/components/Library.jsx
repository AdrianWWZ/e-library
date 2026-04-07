import { useState } from "react";
import DeleteButton from "./DeleteButton";
import DownloadButton from "./DownloadButton";
import { supabase } from "../config/supabaseClient";

const Library = ({ books, loading, onSelectBook, onRefresh }) => {
  // State to track which book's dropdown menu is currently open
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (e, bookId) => {
    e.stopPropagation(); // Prevent the book from opening
    // If the menu is already open, close it. Otherwise, open this one.
    setOpenMenuId(openMenuId === bookId ? null : bookId);
  };

  if (loading)
    return <p style={{ color: "#a0a0a0" }}>Loading your library...</p>;
  if (books.length === 0)
    return (
      <p style={{ color: "#a0a0a0" }}>
        Your library is empty. Upload a book above!
      </p>
    );

  return (
    <div style={{ padding: "20px 0", position: "relative" }}>
      {/* Invisible overlay that closes the menu if you click anywhere else on the screen */}
      {openMenuId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenuId(null);
          }}
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "20px",
        }}
      >
        {books.map((book) => (
          <div
            key={book.id}
            onClick={() => onSelectBook(book)}
            style={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s",
              position: "relative",
              zIndex: openMenuId === book.id ? 10 : 1,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {/* Book Cover */}
            <div
              style={{
                width: "100%",
                aspectRatio: "2/3",
                backgroundColor: "#2a2a2a",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
                position: "relative",
              }}
            >
              <img
                src={
                  book.cover_url ||
                  "https://via.placeholder.com/150x220/333333/ffffff?text=No+Cover"
                }
                alt={book.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />

              {/* Quarter Circle Progress Overlay */}
              {book.percentage > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "45px",
                    height: "45px",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    borderBottomLeftRadius: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                    padding: "6px 8px 0 0",
                    boxSizing: "border-box",
                    pointerEvents: "none",
                  }}
                >
                  <span
                    style={{
                      color: "#ffffff",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  >
                    {book.percentage}%
                  </span>
                </div>
              )}
            </div>

            {/* Text on the left, Menu on the right */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                padding: "10px 4px 0 4px",
              }}
            >
              {/* Left Column: Title & Author */}
              <div style={{ flexGrow: 1, minWidth: 0, paddingRight: "8px" }}>
                <h4
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "1rem",
                    color: "#ffffff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {book.title}
                </h4>
                <p
                  style={{
                    margin: "0",
                    fontSize: "0.8rem",
                    color: "#a0a0a0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    minHeight: "14px",
                  }}
                >
                  {book.author && book.author !== "Unknown Author"
                    ? book.author
                    : ""}
                </p>
              </div>

              {/* Right Column: The 3-Dot Menu */}
              <div style={{ position: "relative", zIndex: 10, flexShrink: 0 }}>
                <button
                  onClick={(e) => toggleMenu(e, book.id)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: "#888888",
                    cursor: "pointer",
                    padding: "0 4px",
                    lineHeight: "1",
                  }}
                  title="Menu"
                >
                  ⋮
                </button>

                {/* The Dropdown Box */}
                {openMenuId === book.id && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: "0",
                      backgroundColor: "#222222",
                      border: "1px solid #333333",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                      borderRadius: "6px",
                      minWidth: "120px",
                      overflow: "hidden",
                      zIndex: 20,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <DownloadButton
                      book={book}
                      onCloseMenu={() => setOpenMenuId(null)}
                    />

                    {/* Separator */}
                    <div
                      style={{
                        height: "1px",
                        width: "100%",
                        backgroundColor: "#333333",
                      }}
                    ></div>

                    <DeleteButton
                      book={book}
                      onRefresh={onRefresh}
                      onCloseMenu={() => setOpenMenuId(null)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
