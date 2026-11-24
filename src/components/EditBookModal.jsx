import { useEffect, useState } from "react";
import { supabase } from "../config/supabaseClient";
import { hasAuthor } from "../utils/books";

const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid var(--border-strong)",
  backgroundColor: "var(--input-bg)",
  color: "var(--text-strong)",
  fontSize: "0.9rem",
};

const fieldLabel = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  fontSize: "0.8rem",
  color: "var(--text-muted)",
};

// "Rename" dialog - edits the title (and author) of a book
const EditBookModal = ({ book, onClose, onSaved }) => {
  const [title, setTitle] = useState(book.title || "");
  const [author, setAuthor] = useState(hasAuthor(book) ? book.author : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Close with the Escape key
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSave = async (e) => {
    e.preventDefault();
    const newTitle = title.trim();
    const newAuthor = author.trim() || "Unknown Author";
    if (!newTitle) {
      setError("Title can't be empty.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const { data, error: dbError } = await supabase
        .from("Books")
        .update({ title: newTitle, author: newAuthor })
        .eq("id", book.id)
        .select("id");
      if (dbError) throw dbError;
      // Row Level Security silently updates 0 rows if you're not the owner
      if (!data || data.length === 0)
        throw new Error("You don't have permission to edit this book.");

      onSaved({ ...book, title: newTitle, author: newAuthor });
      onClose();
    } catch (err) {
      setError(err.message || "Could not save changes.");
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--backdrop)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "16px",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-book-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--surface)",
          padding: "26px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "380px",
          border: "1px solid var(--border)",
          boxShadow: "0 10px 25px var(--shadow)",
          boxSizing: "border-box",
        }}
      >
        <h2
          id="edit-book-title"
          style={{
            color: "var(--text-strong)",
            margin: "0 0 18px",
            fontSize: "1.2rem",
          }}
        >
          Rename book
        </h2>

        <form
          onSubmit={handleSave}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <label style={fieldLabel}>
            Title
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={(e) => e.target.select()}
              style={inputStyle}
            />
          </label>

          <label style={fieldLabel}>
            Author
            <input
              value={author}
              placeholder="Unknown"
              onChange={(e) => setAuthor(e.target.value)}
              style={inputStyle}
            />
          </label>

          {error && (
            <div style={{ color: "var(--danger)", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "6px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 16px",
                borderRadius: "6px",
                border: "1px solid var(--border-strong)",
                background: "transparent",
                color: "var(--text)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "9px 18px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "var(--accent)",
                color: "#fff",
                fontWeight: "bold",
                cursor: saving ? "wait" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookModal;
