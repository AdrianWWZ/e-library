import { pdfjs } from "react-pdf";

// --- VITE WORKER CONFIGURATION ---
// This tells Vite where to find the background worker to process PDFs.
// Imported by anything that uses pdfjs so it's only configured in one place.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export { pdfjs };
