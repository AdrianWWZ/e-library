import React, { useState, useRef, useEffect } from "react";
import { ReactReader } from "react-reader";
import { Document, Page, pdfjs } from "react-pdf";
import { supabase } from "../config/supabaseClient";

// --- REQUIRED CSS FOR PDF.JS ---
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// --- VITE WORKER CONFIGURATION ---
// This tells Vite where to find the background worker to process PDFs
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// 1. Accept 'book' as a prop
const ReaderView = ({ book }) => {
  // Determine the file type
  const isPdf = book.file_url.toLowerCase().includes(".pdf");

  // --- SHARED STATE ---
  // 2. We use a ref to hold our timer without causing React to re-render
  const debounceTimer = useRef(null);

  // --- EPUB SPECIFIC STATE ---
  const [epubLocation, setEpubLocation] = useState(book.cfi || null);
  const [rendition, setRendition] = useState(null); // NEW: Holds the EPUB engine

  // --- PDF SPECIFIC STATE ---
  // If the saved 'cfi' is a number string, parse it. Otherwise, start at page 1.
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(
    book.cfi ? parseInt(book.cfi) : 1,
  );

  // --- SAVE FUNCTION ---
  // accepts both the CFI string AND the calculated percentage
  const saveProgress = (locationString, currentPercentage) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const { progressSaveError } = await supabase
          .from("Books")
          .update({
            cfi: locationString.toString(),
            percentage: currentPercentage,
          })
          .eq("id", book.id);

        if (progressSaveError) throw progressSaveError;
        console.log(`Saved: ${locationString} (${currentPercentage}%)`);
      } catch (err) {
        console.error("Failed to save progress:", err.message);
      }
    }, 1000); // 1 second delay
  };

  // --- CLEANUP TIMER ---
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // --- EPUB HANDLER ---
  const handleEpubLocationChanged = (epubcifi) => {
    setEpubLocation(epubcifi);

    let pct = 0;
    // If the background engine has finished generating the book's locations, do the math!
    if (rendition && rendition.book.locations.length() > 0) {
      // percentageFromCfi returns a decimal (e.g., 0.45). Multiply by 100 to get 45.
      pct = Math.round(
        rendition.book.locations.percentageFromCfi(epubcifi) * 100,
      );
    }

    saveProgress(epubcifi, pct);
  };

  // --- PDF HANDLERS ---
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);

    // Calculate and save percentage when the file loads!
    const pct = Math.round((pageNumber / numPages) * 100);
    saveProgress(pageNumber, pct);
  };

  const changePdfPage = (offset) => {
    const newPage = pageNumber + offset;
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);

      // Calculate PDF percentage
      const pct = Math.round((newPage / numPages) * 100);
      saveProgress(newPage, pct);
    }
  };

  // --- RENDER PDF UI ---
  if (isPdf) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#555",
          minHeight: "100%",
          padding: "20px 0",
        }}
      >
        {/* PDF Controls */}
        <div
          style={{
            marginBottom: "15px",
            display: "flex",
            gap: "15px",
            alignItems: "center",
            backgroundColor: "#333",
            padding: "10px 20px",
            borderRadius: "8px",
            color: "white",
          }}
        >
          <button
            disabled={pageNumber <= 1}
            onClick={() => changePdfPage(-1)}
            style={{
              padding: "8px 16px",
              cursor: pageNumber <= 1 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>

          <span>
            Page {pageNumber} of {numPages || "--"}
          </span>

          <button
            disabled={pageNumber >= numPages}
            onClick={() => changePdfPage(1)}
            style={{
              padding: "8px 16px",
              cursor: pageNumber >= numPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>

        {/* PDF Document Canvas */}
        <Document
          file={book.file_url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div style={{ color: "white" }}>Loading PDF...</div>}
        >
          {/* We render a single page at a time. Width limits it to desktop screens nicely. */}
          <Page
            pageNumber={pageNumber}
            width={Math.min(window.innerWidth * 0.9, 800)}
          />
        </Document>
      </div>
    );
  }

  // --- RENDER EPUB UI ---
  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <ReactReader
        url={book.file_url}
        location={epubLocation}
        locationChanged={handleEpubLocationChanged}
        epubOptions={{ allowScriptedContent: true }}
        // Tell the engine to map out the book in the background
        getRendition={(rendition) => {
          setRendition(rendition);
          rendition.book.locations.generate(1600).then(() => {
            // This code runs ONLY when the background math is 100% finished
            const liveLocation = rendition.currentLocation();

            if (liveLocation && liveLocation.start) {
              const currentCfi = liveLocation.start.cfi;
              const pct = Math.round(
                rendition.book.locations.percentageFromCfi(currentCfi) * 100,
              );

              saveProgress(currentCfi, pct);
            }
          });
        }}
      />
    </div>
  );
};

export default ReaderView;
