import { useState, useRef } from "react";
import { supabase } from "../config/supabaseClient";
import ePub from "epubjs";
import { pdfjs } from "react-pdf";
import DashButton from "./DashButton";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const UploadButton = ({ onRefresh }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [messageColor, setMessageColor] = useState("#a0a0a0");

  const fileInputRef = useRef(null);

  const showMessage = (text, color) => {
    setMessageColor(color);
    if (text.length > 50) {
      setUploadMessage(text.substring(0, 50) + "...");
    } else {
      setUploadMessage(text);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const isEpub = file.name.toLowerCase().endsWith(".epub");
    const isPdf = file.name.toLowerCase().endsWith(".pdf");

    if (!isEpub && !isPdf) {
      showMessage("Please select a PDF or EPUB file.", "#ff4d4f");
      return;
    }

    setIsUploading(true);
    showMessage("Extracting cover and uploading...", "#3b82f6");

    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
      const uniquePrefix = Date.now();

      let bookTitle = file.name.replace(/\.[^/.]+$/, ""); // Default to filename without extension
      let bookAuthor = "Unknown Author";
      let finalCoverUrl =
        "https://via.placeholder.com/150x220/333333/ffffff?text=PDF+Document"; // Default PDF cover

      // --- 1. EXTRACT EPUB METADATA & COVER ---
      if (isEpub) {
        const book = ePub(file);

        // Wait for the book to parse
        await book.ready;

        // Get Title and Author
        const meta = await book.loaded.metadata;
        if (meta.title) bookTitle = meta.title;
        if (meta.creator) bookAuthor = meta.creator;

        // Get Cover Image
        const coverBlobUrl = await book.coverUrl();
        if (coverBlobUrl) {
          // epubjs returns a local blob URL. We need to fetch it and turn it into a real File to upload
          const response = await fetch(coverBlobUrl);
          const blob = await response.blob();
          const coverFile = new File([blob], `cover-${uniquePrefix}.jpg`, {
            type: blob.type,
          });

          // Upload the cover to Supabase
          const { error: coverError } = await supabase.storage
            .from("Covers")
            .upload(coverFile.name, coverFile);

          if (!coverError) {
            const { data: coverData } = supabase.storage
              .from("Covers")
              .getPublicUrl(coverFile.name);
            finalCoverUrl = coverData.publicUrl;
          }
        }
      }

      // --- 2. EXTRACT PDF COVER ---
      if (isPdf) {
        try {
          // Create a temporary local URL for the PDF file so pdfjs can read it
          const fileUrl = URL.createObjectURL(file);

          // Load the PDF and fetch Page 1
          const loadingTask = pdfjsLib.getDocument(fileUrl);
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);

          // Create an invisible HTML canvas
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          // Scale the PDF down so we aren't uploading massive 4K cover images
          const unscaledViewport = page.getViewport({ scale: 1.0 });
          const scale = 300 / unscaledViewport.width; // Force the width to be 300px
          const viewport = page.getViewport({ scale });

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // "Draw" the PDF page onto the canvas
          await page.render({ canvasContext: context, viewport: viewport })
            .promise;

          // Convert the canvas drawing into a JPEG file
          const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", 0.8),
          );
          const coverFile = new File([blob], `cover-${uniquePrefix}.jpg`, {
            type: "image/jpeg",
          });

          // Upload the JPEG to Supabase
          const { error: coverError } = await supabase.storage
            .from("Covers")
            .upload(coverFile.name, coverFile);

          if (!coverError) {
            const { data } = supabase.storage
              .from("Covers")
              .getPublicUrl(coverFile.name);
            finalCoverUrl = data.publicUrl;
          }

          // Clean up the temporary URL from the browser's memory
          URL.revokeObjectURL(fileUrl);
        } catch (pdfError) {
          console.error("PDF Cover failed:", pdfError);
        }
      }

      // 1. Upload the file to the 'Books' bucket using the clean name
      const filePath = `${uniquePrefix}-${cleanFileName}`;
      const { error: fileError } = await supabase.storage
        .from("Books")
        .upload(filePath, file);
      if (fileError) throw fileError;

      // 2. Get the public URL for the reader to use
      const { data: urlData } = supabase.storage
        .from("Books")
        .getPublicUrl(filePath);

      // 3. Save to Database
      const { error: dbError } = await supabase.from("Books").insert([
        {
          title: bookTitle,
          author: bookAuthor,
          cover_url: finalCoverUrl,
          file_url: urlData.publicUrl,
          file_location: "Home",
          owner: "admin",
          last_accessed_at: new Date().toISOString(),
        },
      ]);
      if (dbError) throw dbError;

      showMessage(`Successfully Added "${bookTitle}"`, "#28a745");
      setTimeout(() => setUploadMessage(""), 5000);
    } catch (error) {
      console.error("Upload failed:", error);
      showMessage("Upload failed. Check console.", "#ff4d4f");
    } finally {
      setIsUploading(false);
      if (onRefresh) onRefresh();
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const uploadIcon = (
    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
      upload
    </span>
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <DashButton
        icon={uploadIcon}
        label="Upload"
        alwaysShowLabel={true}
        disabled={isUploading}
        onClick={() => fileInputRef.current.click()}
      />

      {uploadMessage && (
        <span
          style={{
            marginLeft: "12px",
            fontSize: "0.85rem",
            color: messageColor,
            fontWeight: "500",
            transition: "opacity 0.3s",
          }}
        >
          {uploadMessage}
        </span>
      )}

      <input
        type="file"
        accept=".pdf,.epub"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default UploadButton;
