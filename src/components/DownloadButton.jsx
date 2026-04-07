import { useState } from "react";
import { supabase } from "../config/supabaseClient";

const DownloadButton = ({ book, onCloseMenu }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();

    try {
      setIsDownloading(true);

      // 1. Get filename from the Supabase URL
      const fileName = decodeURIComponent(book.file_url.split("/").pop());

      // 2. Download the file as Blob from the bucket
      const { data, error } = await supabase.storage
        .from("Books")
        .download(fileName);
      if (error) throw error;

      // 3. Create an invisible anchor tag to force the browser to save the file
      const blobUrl = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = blobUrl;

      // Clean up the file name for the user (removes the timestamp prefix we added on upload)
      const cleanName =
        fileName.substring(fileName.indexOf("-") + 1) || fileName;
      link.download = cleanName;

      document.body.appendChild(link);
      link.click();

      // Clean up the temporary URL
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error.message);
      alert("Failed to download the book.");
    } finally {
      setIsDownloading(false);
      if (onCloseMenu) onCloseMenu();
    }
  };

  return (
    <button
      onClick={handleDownload}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isDownloading}
      style={{
        display: "block",
        width: "100%",
        padding: "10px 16px",
        textAlign: "left",
        border: "none",
        color: "#e0e0e0",
        fontSize: "0.9rem",
        transition: "background-color 0.2s",
        backgroundColor: isHovered ? "#333333" : "transparent",
        cursor: isDownloading ? "wait" : "pointer",
      }}
    >
      {isDownloading ? "Downloading..." : "Download"}
    </button>
  );
};

export default DownloadButton;
