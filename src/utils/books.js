// Small helpers shared by the library, reader and menus.

// Raw storage filename from the end of a Supabase public URL
export const getStorageFileName = (url = "") =>
  decodeURIComponent(url.split("?")[0].split("/").pop() || "");

export const getFileExtension = (book) => {
  const name = getStorageFileName(book.file_url).toLowerCase();
  return name.includes(".") ? name.split(".").pop() : "";
};

export const isPdfBook = (book) => getFileExtension(book) === "pdf";

// True when the cover lives in your Supabase storage (not an external
// placeholder link) - used for deleting covers and counting storage.
export const isStoredCover = (book) =>
  Boolean(book.cover_url) && book.cover_url.includes("/storage/v1/object/");

export const hasAuthor = (book) =>
  Boolean(book.author) && book.author !== "Unknown Author";

// Turn a book title into something safe to use as a download filename
export const toSafeFileName = (title, fallback = "book") => {
  const cleaned = (title || "")
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return cleaned || fallback;
};

// --- Reading status ---------------------------------------------------
// EPUB progress is measured from the *start* of the visible page, so the
// last page of a book often reports 98-99% rather than 100%.
export const FINISHED_AT = 98;

export const getReadingStatus = (book) => {
  const pct = Number(book.percentage) || 0;
  if (pct >= FINISHED_AT) return "finished";
  if (pct > 0) return "reading";
  return "unread";
};

// --- Filtering & sorting ------------------------------------------------
export const DEFAULT_FILTERS = { search: "", type: "all", status: "all" };

export const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pdf", label: "PDF" },
  { value: "epub", label: "EPUB" },
];

export const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "reading", label: "Reading" },
  { value: "finished", label: "Finished" },
];

export const SORT_OPTIONS = [
  { value: "recent", label: "Recently opened" },
  { value: "added", label: "Recently added" },
  { value: "title", label: "Title (A–Z)" },
  { value: "author", label: "Author (A–Z)" },
  { value: "progress", label: "Progress" },
];

export const hasActiveFilters = (filters) =>
  filters.search.trim() !== "" ||
  filters.type !== "all" ||
  filters.status !== "all";

const byText = (a = "", b = "") =>
  a.localeCompare(b, undefined, { sensitivity: "base", numeric: true });

const byDateDesc = (a, b) =>
  new Date(b || 0).getTime() - new Date(a || 0).getTime();

const SORTERS = {
  recent: (a, b) => byDateDesc(a.last_accessed_at, b.last_accessed_at),
  added: (a, b) => byDateDesc(a.created_at, b.created_at),
  title: (a, b) => byText(a.title, b.title),
  author: (a, b) =>
    // Books without an author go to the bottom
    Number(!hasAuthor(a)) - Number(!hasAuthor(b)) ||
    byText(a.author, b.author) ||
    byText(a.title, b.title),
  progress: (a, b) =>
    (Number(b.percentage) || 0) - (Number(a.percentage) || 0) ||
    byDateDesc(a.last_accessed_at, b.last_accessed_at),
};

export const filterAndSortBooks = (books, filters, sort) => {
  const query = filters.search.trim().toLowerCase();

  const filtered = books.filter((book) => {
    if (filters.type !== "all" && getFileExtension(book) !== filters.type)
      return false;
    if (filters.status !== "all" && getReadingStatus(book) !== filters.status)
      return false;
    if (query) {
      const haystack = `${book.title || ""} ${
        hasAuthor(book) ? book.author : ""
      }`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  return filtered.sort(SORTERS[sort] || SORTERS.recent);
};
