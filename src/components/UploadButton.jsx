import React, { useState } from "react";
import { supabase } from "../config/supabaseClient";
import ePub from "epubjs";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const UploadButton = ({ onRefresh }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const isEpub = file.name.toLowerCase().endsWith(".epub");
    const isPdf = file.name.toLowerCase().endsWith(".pdf");

    if (!isEpub && !isPdf) {
      setUploadMessage("Please select a PDF or EPUB file.");
      return;
    }

    setIsUploading(true);
    setUploadMessage("Uploading to Supabase...");

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
          const renderContext = { canvasContext: context, viewport: viewport };
          await page.render(renderContext).promise;

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
            const { data: coverData } = supabase.storage
              .from("Covers")
              .getPublicUrl(coverFile.name);
            finalCoverUrl = coverData.publicUrl;
          }

          // Clean up the temporary URL from the browser's memory
          URL.revokeObjectURL(fileUrl);
        } catch (pdfError) {
          console.error(
            "Failed to extract PDF cover, using default:",
            pdfError,
          );
          // It safely falls back to the generic gray box if this fails!
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
      const downloadURL = urlData.publicUrl;

      // 3. Save to Database
      const { error: dbError } = await supabase.from("Books").insert([
        {
          title: bookTitle,
          author: bookAuthor,
          cover_url: finalCoverUrl,
          file_url: downloadURL,
        },
      ]);
      if (dbError) throw dbError;

      setUploadMessage(`Success! Added "${bookTitle}" to library.`);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadMessage("Upload failed. Check console for details.");
    } finally {
      setIsUploading(false);
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#1e1e1e",
        color: "#e0e0e0",
        borderRadius: "8px",
        border: "1px solid #333",
        marginBottom: "20px",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Add to Library</h3>
      <input
        type="file"
        accept=".pdf,.epub"
        onChange={handleFileUpload}
        disabled={isUploading}
      />
      <p
        style={{
          marginTop: "10px",
          color: isUploading ? "#0066cc" : "#28a745",
          fontWeight: "bold",
        }}
      >
        {uploadMessage}
      </p>
    </div>
  );
};

export default UploadButton;
