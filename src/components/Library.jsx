import React, { useState } from "react";
import { supabase } from "../config/supabaseClient";

const Library = ({ books, loading, onSelectBook, onRefresh }) => {
  const [deletingId, setDeletingId] = useState(null);
  // State to track which book's dropdown menu is currently open
  const [openMenuId, setOpenMenuId] = useState(null);
  // State to track if the mouse is hovering over a specific delete button
  const [hoveredDeleteId, setHoveredDeleteId] = useState(null);

  const handleDelete = async (e, book) => {
    e.stopPropagation(); // Prevents the book from opening when you click delete!
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${book.title}"?`,
    );
    if (!confirmDelete) {
      setOpenMenuId(null);
      return;
    }

    try {
      setDeletingId(book.id);

      // 1. Extract the raw filename from the end of the Supabase URL
      const fileName = decodeURIComponent(book.file_url.split("/").pop());

      // 2. Delete the file from the Storage Bucket
      const { error: storageError } = await supabase.storage
        .from("Books")
        .remove([fileName]);
      if (storageError) throw storageError;

      // 3. Delete Cover Image from Storage Bucket
      if (book.cover_url && !book.cover_url.includes("via.placeholder.com")) {
        const coverName = decodeURIComponent(book.cover_url.split("/").pop());
        const { error: coverError } = await supabase.storage
          .from("Covers")
          .remove([coverName]);
        if (coverError) throw coverError;
      }

      // 4. Delete the text row from the Database
      const { error: dbError } = await supabase
        .from("Books")
        .delete()
        .eq("id", book.id);
      if (dbError) throw dbError;

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error deleting book:", error.message);
      alert("Failed to delete the book.");
    } finally {
      setDeletingId(null);
      setOpenMenuId(null);
    }
  };

  const toggleMenu = (e, bookId) => {
    e.stopPropagation(); // Prevent the book from opening
    // If the menu is already open, close it. Otherwise, open this one.
    setOpenMenuId(openMenuId === bookId ? null : bookId);
  };

  if (loading) return <p>Loading your library...</p>;
  if (books.length === 0)
    return <p>Your library is empty. Upload a book above!</p>;

  return (
    <div style={{ padding: "20px 0", position: "relative" }}>
      <h2 style={{ color: "#ffffff" }}>My Bookshelf</h2>

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
            </div>

            {/* UPDATED LAYOUT: Text on the left, Menu on the right */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                padding: "10px 4px 0 4px",
              }}
            >
              {/* Left Column: Title, Author, and Progress */}
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
                    margin: "0 0 8px 0",
                    fontSize: "0.8rem",
                    color: "#a0a0a0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {book.author}
                </p>

                {/* Visual Progress Bar */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.75rem",
                      color: "#888888",
                      marginBottom: "4px",
                    }}
                  >
                    <span>
                      {book.percentage > 0
                        ? `${book.percentage}% Read`
                        : "Unread"}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      backgroundColor: "#333333",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${book.percentage || 0}%`,
                        height: "100%",
                        backgroundColor: "#3b82f6",
                        transition: "width 0.3s ease",
                      }}
                    ></div>
                  </div>
                </div>
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
                      right: "0", // Changed from left: 0 so it opens inward
                      backgroundColor: "#222222",
                      border: "1px solid #333333", // Subtle border
                      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                      borderRadius: "6px",
                      minWidth: "120px",
                      overflow: "hidden",
                      zIndex: 20,
                    }}
                  >
                    <button
                      onClick={(e) => {
                        setOpenMenuId(null);
                        handleDelete(e, book);
                      }}
                      onMouseEnter={() => setHoveredDeleteId(book.id)} // Detect Hover In
                      onMouseLeave={() => setHoveredDeleteId(null)} // Detect Hover Out
                      disabled={deletingId === book.id}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 16px",
                        textAlign: "left",
                        border: "none",
                        color: "#ff4d4f",
                        fontSize: "0.9rem",
                        transition: "background-color 0.2s",
                        // dynamically change background and cursor based on state
                        backgroundColor:
                          hoveredDeleteId === book.id
                            ? "#3a1616"
                            : "transparent",
                        cursor: deletingId === book.id ? "wait" : "pointer",
                      }}
                    >
                      {deletingId === book.id ? "Deleting..." : "Delete File"}
                    </button>
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
