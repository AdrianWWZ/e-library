import { useEffect, useRef, useState } from "react";
import { isPdfBook } from "../utils/books";
import { getPdfFirstPage } from "../utils/pdfFirstPage";

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "top",
  display: "block",
};

// Last resort: a plain card with the title (EPUBs with no cover image)
const TitleCard = ({ book }) => {
  const pdf = isPdfBook(book);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        padding: "18px 14px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(160deg, var(--input-bg) 0%, var(--cover-bg) 100%)",
        color: "var(--text-muted)",
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
        {pdf ? "picture_as_pdf" : "menu_book"}
      </span>
      <span
        style={{
          color: "var(--text)",
          fontWeight: 600,
          fontSize: "0.95rem",
          lineHeight: 1.3,
          display: "-webkit-box",
          WebkitLineClamp: 5,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          wordBreak: "break-word",
        }}
      >
        {book.title}
      </span>
      <span
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.08em",
          color: "var(--text-faint)",
        }}
      >
        {pdf ? "PDF" : "EPUB"}
      </span>
    </div>
  );
};

// PDFs without a usable saved cover: show their first page instead.
// Only drawn once the book scrolls near the screen.
const PdfFirstPage = ({ book }) => {
  const holder = useRef(null);
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        getPdfFirstPage(book.file_url)
          .then((url) => !cancelled && setSrc(url))
          .catch((err) => {
            console.warn(
              `Couldn't draw first page of "${book.title}":`,
              err.message,
            );
            if (!cancelled) setFailed(true);
          });
      },
      { rootMargin: "300px" },
    );
    observer.observe(holder.current);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [book.file_url, book.title]);

  if (failed) return <TitleCard book={book} />;

  return (
    <div
      ref={holder}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "var(--cover-bg)",
      }}
    >
      {src && <img src={src} alt={book.title} style={imageStyle} />}
    </div>
  );
};

// Always shows the book's saved cover, exactly as before.
// If there's no saved cover (or it can't be loaded):
//   PDF  -> its first page
//   EPUB -> a title card (instead of a broken-image icon)
const BookCover = ({ book }) => {
  const [failed, setFailed] = useState(false);

  if (book.cover_url && !failed) {
    return (
      <img
        src={book.cover_url}
        alt={book.title}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ ...imageStyle, objectPosition: "center" }}
      />
    );
  }

  if (isPdfBook(book)) return <PdfFirstPage book={book} />;

  return <TitleCard book={book} />;
};

export default BookCover;
