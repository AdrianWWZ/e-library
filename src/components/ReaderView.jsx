import { useState } from "react";
import { useSettings } from "../context/settings";
import { useProgressSaver } from "../hooks/useProgressSaver";
import { isPdfBook } from "../utils/books";
import DashButton from "./DashButton";
import EpubReader from "./EpubReader";
import PdfReader from "./PdfReader";

const ReaderView = ({ book, onBack, onProgress, canSave }) => {
  const { theme, toggleTheme } = useSettings();
  const [backHovered, setBackHovered] = useState(false);

  // Shared progress saving for both PDF and EPUB
  const save = useProgressSaver(book.id, { enabled: canSave, onProgress });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--reader-bg)",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "10px 20px",
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <button
          onClick={onBack}
          onMouseEnter={() => setBackHovered(true)}
          onMouseLeave={() => setBackHovered(false)}
          title="Back to Library"
          style={{
            flexShrink: 0,
            padding: "8px 16px",
            cursor: "pointer",
            backgroundColor: backHovered ? "var(--hover)" : "transparent",
            color: "var(--text)",
            border: "1px solid var(--border-strong)",
            borderRadius: "6px",
            transition: "background-color 0.2s",
          }}
        >
          ← <span className="hide-narrow">Back to Library</span>
        </button>

        <div
          title={book.title}
          style={{
            flex: 1,
            minWidth: 0,
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {book.title}
        </div>

        {/* Lights: light / dark reading */}
        <DashButton
          icon={
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "20px" }}
            >
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          }
          label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          expandable={false}
          onClick={toggleTheme}
        />
      </div>

      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        {isPdfBook(book) ? (
          <PdfReader book={book} save={save} />
        ) : (
          <EpubReader book={book} theme={theme} save={save} />
        )}
      </div>
    </div>
  );
};

export default ReaderView;
