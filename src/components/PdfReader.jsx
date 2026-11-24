import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import "../config/pdfWorker";
import PdfPageDownload from "./PdfPageDownload";

// --- REQUIRED CSS FOR PDF.JS ---
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Width limits it to desktop screens nicely
const pageWidth = () => Math.min(window.innerWidth * 0.92, 800);

// For PDFs the saved 'cfi' is just the page number
const savedPage = (book) => {
  const n = parseInt(book.cfi, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

const NavButton = ({ icon, label, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    style={{
      display: "flex",
      alignItems: "center",
      padding: "6px",
      borderRadius: "6px",
      border: "1px solid var(--border-strong)",
      background: "transparent",
      color: disabled ? "var(--text-disabled)" : "var(--text)",
      cursor: disabled ? "not-allowed" : "pointer",
    }}
  >
    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
      {icon}
    </span>
  </button>
);

const PdfReader = ({ book, save }) => {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(() => savedPage(book));
  const [pageInput, setPageInput] = useState(() => String(savedPage(book)));
  const [width, setWidth] = useState(pageWidth);
  const stageRef = useRef(null);

  // Resize the page with the window
  useEffect(() => {
    const onResize = () => setWidth(pageWidth());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const goToPage = useCallback(
    (n) => {
      if (!numPages || !Number.isFinite(n)) return;
      const page = Math.min(Math.max(1, n), numPages);
      setPageNumber(page);
      setPageInput(String(page));
      // Calculate PDF percentage
      save(page, Math.round((page / numPages) * 100));
      stageRef.current?.scrollTo({ top: 0 });
    },
    [numPages, save],
  );

  // ← / → keys turn pages (ignored while typing in a box)
  useEffect(() => {
    const onKey = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if (e.key === "ArrowRight" || e.key === "PageDown")
        goToPage(pageNumber + 1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") goToPage(pageNumber - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goToPage, pageNumber]);

  const onDocumentLoadSuccess = (doc) => {
    setPdf(doc);
    setNumPages(doc.numPages);
    const page = Math.min(pageNumber, doc.numPages);
    setPageNumber(page);
    setPageInput(String(page));
    // Calculate and save percentage when the file loads!
    save(page, Math.round((page / doc.numPages) * 100));
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* PDF Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "8px 12px",
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          color: "var(--text)",
          fontSize: "0.9rem",
        }}
      >
        <NavButton
          icon="chevron_left"
          label="Previous page"
          disabled={pageNumber <= 1}
          onClick={() => goToPage(pageNumber - 1)}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            goToPage(parseInt(pageInput, 10));
            e.target.querySelector("input")?.blur();
          }}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <span className="hide-narrow">Page</span>
          <input
            value={pageInput}
            inputMode="numeric"
            aria-label="Page number"
            onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ""))}
            onBlur={() => setPageInput(String(pageNumber))}
            style={{
              width: `${Math.max(String(numPages || 0).length, 2) + 1}ch`,
              textAlign: "center",
              padding: "5px 4px",
              borderRadius: "6px",
              border: "1px solid var(--border-strong)",
              backgroundColor: "var(--input-bg)",
              color: "var(--text)",
              fontSize: "0.9rem",
            }}
          />
          <span>of {numPages || "--"}</span>
        </form>

        <NavButton
          icon="chevron_right"
          label="Next page"
          disabled={!numPages || pageNumber >= numPages}
          onClick={() => goToPage(pageNumber + 1)}
        />

        <div style={{ width: "8px" }} />

        <PdfPageDownload
          pdf={pdf}
          pageNumber={pageNumber}
          numPages={numPages}
          book={book}
        />
      </div>

      {/* PDF Document Canvas */}
      <div
        ref={stageRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          backgroundColor: "var(--pdf-stage)",
          padding: "20px 0",
          boxSizing: "border-box",
        }}
      >
        <Document
          file={book.file_url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div style={{ color: "var(--text-muted)", textAlign: "center" }}>
              Loading PDF...
            </div>
          }
          error={
            <div style={{ color: "var(--danger)", textAlign: "center" }}>
              Couldn't load this PDF.
            </div>
          }
        >
          {/* Dark mode inverts the page colours (white paper -> dark grey) */}
          <div
            style={{
              width: "fit-content",
              margin: "0 auto",
              filter: "var(--pdf-filter)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
            }}
          >
            {/* We render a single page at a time */}
            <Page pageNumber={pageNumber} width={width} />
          </div>
        </Document>
      </div>
    </div>
  );
};

export default PdfReader;
