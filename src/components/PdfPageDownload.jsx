import { useState } from "react";
import MenuItem from "./MenuItem";
import { downloadBlob } from "../utils/files";
import { toSafeFileName } from "../utils/books";
import { parsePageRange } from "../utils/pageRange";

// Copy the chosen pages into a brand new PDF (keeps text sharp & selectable)
const extractPages = async (pdf, pageNumbers) => {
  // pdf-lib is only downloaded the first time someone uses this
  const { PDFDocument } = await import("pdf-lib");
  const bytes = await pdf.getData();
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const output = await PDFDocument.create();
  const copied = await output.copyPages(
    source,
    pageNumbers.map((n) => n - 1),
  );
  copied.forEach((page) => output.addPage(page));
  return new Blob([await output.save()], { type: "application/pdf" });
};

// Render one page to a PNG at 2x resolution
const renderPageImage = async (pdf, pageNumber) => {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  await page.render({ canvas, viewport }).promise;
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
};

const PdfPageDownload = ({ pdf, pageNumber, numPages, book }) => {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState("");
  const [busy, setBusy] = useState(null); // which action is running
  const [error, setError] = useState("");

  const baseName = toSafeFileName(book.title);

  const run = async (kind, task) => {
    setBusy(kind);
    setError("");
    try {
      await task();
      setOpen(false);
      setRange("");
    } catch (err) {
      // RangeError = a typo in the page box, not worth logging
      if (!(err instanceof RangeError))
        console.error("Page download failed:", err);
      setError(err.message || "Download failed");
    } finally {
      setBusy(null);
    }
  };

  const downloadCurrentPdf = () =>
    run("pdf", async () => {
      const blob = await extractPages(pdf, [pageNumber]);
      downloadBlob(blob, `${baseName} - p${pageNumber}.pdf`);
    });

  const downloadCurrentImage = () =>
    run("png", async () => {
      const blob = await renderPageImage(pdf, pageNumber);
      downloadBlob(blob, `${baseName} - p${pageNumber}.png`);
    });

  const downloadRange = (e) => {
    e.preventDefault();
    run("range", async () => {
      const pages = parsePageRange(range, numPages);
      const label = range
        .replace(/\s*[-–]\s*/g, "-")
        .replace(/\s*,\s*/g, ",")
        .trim();
      const blob = await extractPages(pdf, pages);
      downloadBlob(
        blob,
        `${baseName} - ${pages.length === 1 ? "p" : "pages "}${toSafeFileName(label, "selection")}.pdf`,
      );
    });
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        disabled={!pdf}
        title="Download pages"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px solid var(--border-strong)",
          backgroundColor: open ? "var(--hover)" : "transparent",
          color: pdf ? "var(--text)" : "var(--text-disabled)",
          cursor: pdf ? "pointer" : "not-allowed",
          fontSize: "0.85rem",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "18px" }}
        >
          download
        </span>
        <span className="hide-narrow">Pages</span>
      </button>

      {open && (
        <>
          {/* click outside to close */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 30 }}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              zIndex: 31,
              width: "250px",
              backgroundColor: "var(--surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              boxShadow: "0 8px 24px var(--shadow)",
              overflow: "hidden",
            }}
          >
            <MenuItem
              icon="picture_as_pdf"
              onClick={downloadCurrentPdf}
              busy={!!busy}
            >
              {busy === "pdf" ? "Preparing..." : `Page ${pageNumber} as PDF`}
            </MenuItem>
            <MenuItem icon="image" onClick={downloadCurrentImage} busy={!!busy}>
              {busy === "png" ? "Rendering..." : `Page ${pageNumber} as image`}
            </MenuItem>

            <div style={{ height: "1px", backgroundColor: "var(--border)" }} />

            <form onSubmit={downloadRange} style={{ padding: "12px 16px" }}>
              <label
                htmlFor="pdf-page-range"
                style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}
              >
                Choose pages (1–{numPages})
              </label>
              <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                <input
                  id="pdf-page-range"
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  placeholder="e.g. 1-3, 8"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: "7px 8px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-strong)",
                    backgroundColor: "var(--input-bg)",
                    color: "var(--text)",
                    fontSize: "0.85rem",
                  }}
                />
                <button
                  type="submit"
                  disabled={!!busy}
                  style={{
                    padding: "7px 12px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "var(--accent)",
                    color: "#fff",
                    cursor: busy ? "wait" : "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  {busy === "range" ? "..." : "PDF"}
                </button>
              </div>
              {error && (
                <div
                  style={{
                    color: "var(--danger)",
                    fontSize: "0.8rem",
                    marginTop: "8px",
                  }}
                >
                  {error}
                </div>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default PdfPageDownload;
