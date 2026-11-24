import { pdfjs } from "../config/pdfWorker";

/*
  Draws page 1 of a PDF as a small image, for PDFs whose saved cover is
  missing or won't load. Nothing is uploaded or saved - it's only drawn
  in the browser.

  - Results are cached for the session, so each PDF is drawn once.
  - At most 2 PDFs are drawn at a time, so a big library doesn't
    download everything at once.
*/

const cache = new Map(); // file_url -> Promise<objectURL>
const waiting = [];
let running = 0;
const MAX_AT_ONCE = 2;

const runLimited = (task) =>
  new Promise((resolve, reject) => {
    const start = () => {
      running++;
      task()
        .then(resolve, reject)
        .finally(() => {
          running--;
          waiting.shift()?.();
        });
    };
    if (running < MAX_AT_ONCE) start();
    else waiting.push(start);
  });

const drawFirstPage = async (url, width = 300) => {
  // disableAutoFetch: only download the parts of the file page 1 needs
  // (when the server supports it)
  const loadingTask = pdfjs.getDocument({ url, disableAutoFetch: true });
  try {
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const unscaled = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: width / unscaled.width });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvas, viewport }).promise;

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8),
    );
    if (!blob) throw new Error("Could not draw the first page");
    return URL.createObjectURL(blob);
  } finally {
    loadingTask.destroy();
  }
};

export const getPdfFirstPage = (fileUrl) => {
  if (!cache.has(fileUrl)) {
    cache.set(
      fileUrl,
      runLimited(() => drawFirstPage(fileUrl)),
    );
  }
  return cache.get(fileUrl);
};
