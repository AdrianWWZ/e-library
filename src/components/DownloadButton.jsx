import { useState } from "react";
import { supabase } from "../config/supabaseClient";
import MenuItem from "./MenuItem";
import { downloadBlob } from "../utils/files";
import {
  getStorageFileName,
  getFileExtension,
  toSafeFileName,
} from "../utils/books";

const DownloadButton = ({ book, onCloseMenu }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();

    try {
      setIsDownloading(true);

      // 1. Get filename from the Supabase URL
      const fileName = getStorageFileName(book.file_url);

      // 2. Download the file as Blob from the bucket
      //    (falls back to the public URL, e.g. for guests)
      let blob;
      const { data, error } = await supabase.storage
        .from("Books")
        .download(fileName);
      if (!error && data) {
        blob = data;
      } else {
        const res = await fetch(book.file_url);
        if (!res.ok) throw error || new Error(`HTTP ${res.status}`);
        blob = await res.blob();
      }

      // 3. Save it using the book's (possibly renamed) title
      const ext = getFileExtension(book);
      downloadBlob(
        blob,
        `${toSafeFileName(book.title)}${ext ? `.${ext}` : ""}`,
      );
    } catch (error) {
      console.error("Error downloading file:", error.message);
      alert("Failed to download the book.");
    } finally {
      setIsDownloading(false);
      if (onCloseMenu) onCloseMenu();
    }
  };

  return (
    <MenuItem icon="download" onClick={handleDownload} busy={isDownloading}>
      {isDownloading ? "Downloading..." : "Download"}
    </MenuItem>
  );
};

export default DownloadButton;
