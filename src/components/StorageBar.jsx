import { useEffect, useMemo, useState } from "react";
import { getTotalStorageSize } from "../utils/storageSize";
import { formatBytes } from "../utils/files";
import { isStoredCover } from "../utils/books";

// Supabase free plan = 1 GB of file storage. Override with VITE_STORAGE_LIMIT_MB
// in your .env (e.g. 102400 for the 100 GB Pro plan).
const LIMIT_MB = Number(import.meta.env.VITE_STORAGE_LIMIT_MB) || 1024;
const LIMIT_BYTES = LIMIT_MB * 1024 * 1024;

const StorageBar = ({ books, compact = false }) => {
  const [usage, setUsage] = useState(null); // { used, unknown }

  // A stable string key, so renaming a book doesn't trigger a recount
  const urlKey = useMemo(
    () =>
      books
        .flatMap((b) => [b.file_url, isStoredCover(b) ? b.cover_url : null])
        .filter(Boolean)
        .join("\n"),
    [books],
  );

  useEffect(() => {
    let cancelled = false;
    getTotalStorageSize(urlKey ? urlKey.split("\n") : []).then((result) => {
      if (!cancelled) setUsage(result);
    });
    return () => {
      cancelled = true;
    };
  }, [urlKey]);

  const used = usage?.used ?? 0;
  const ratio = Math.min(used / LIMIT_BYTES, 1);
  const barColor =
    ratio >= 0.95
      ? "var(--danger)"
      : ratio >= 0.8
        ? "var(--warning)"
        : "var(--accent)";

  const label = usage
    ? `${formatBytes(used)} of ${formatBytes(LIMIT_BYTES)} used`
    : "Calculating…";

  const tooltip = usage
    ? `${books.length} book${books.length === 1 ? "" : "s"} · ${Math.round(
        ratio * 100,
      )}% of your storage` +
      (usage.unknown ? ` · ${usage.unknown} file(s) couldn't be measured` : "")
    : "";

  return (
    <div
      title={tooltip}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? "5px" : "8px",
        width: compact ? "150px" : "100%",
      }}
    >
      {!compact && (
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--text-faint)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "16px" }}
          >
            cloud
          </span>
          Storage
        </span>
      )}

      {/* The line */}
      <div
        role="progressbar"
        aria-label="Storage used"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
        style={{
          height: compact ? "4px" : "6px",
          borderRadius: "999px",
          backgroundColor: "var(--track)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${usage ? Math.max(ratio * 100, used > 0 ? 1.5 : 0) : 0}%`,
            backgroundColor: barColor,
            borderRadius: "999px",
            transition: "width 0.6s ease, background-color 0.3s ease",
          }}
        />
      </div>

      <span
        style={{
          fontSize: compact ? "0.72rem" : "0.8rem",
          color: compact ? "var(--text-faint)" : "var(--text)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
};

export default StorageBar;
