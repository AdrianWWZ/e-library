import { useEffect, useRef, useState } from "react";
import { ReactReader, ReactReaderStyle } from "react-reader";

// Colours of the reader *around* the book (arrows, table of contents...).
// They use the theme variables so they follow light / dark mode.
const READER_STYLES = {
  ...ReactReaderStyle,
  readerArea: {
    ...ReactReaderStyle.readerArea,
    backgroundColor: "var(--reader-bg)",
    transition: undefined,
  },
  titleArea: { ...ReactReaderStyle.titleArea, color: "var(--text-faint)" },
  arrow: { ...ReactReaderStyle.arrow, color: "var(--text-disabled)" },
  arrowHover: { ...ReactReaderStyle.arrowHover, color: "var(--text-muted)" },
  tocArea: { ...ReactReaderStyle.tocArea, background: "var(--surface)" },
  tocAreaButton: {
    ...ReactReaderStyle.tocAreaButton,
    color: "var(--text-muted)",
    borderBottom: "1px solid var(--border)",
  },
  tocButtonExpanded: {
    ...ReactReaderStyle.tocButtonExpanded,
    background: "var(--surface)",
  },
  tocButtonBar: {
    ...ReactReaderStyle.tocButtonBar,
    background: "var(--text-faint)",
  },
  loadingView: { ...ReactReaderStyle.loadingView, color: "var(--text-faint)" },
};

// Styles injected *inside* the book's pages. epub.js puts the selected theme
// name on the <body> as a class, so these rules only apply in dark mode.
// !important is needed because many books hard-code black text / white pages.
const BOOK_THEME_RULES = {
  "body.reader-dark": {
    background: "#121212 !important",
    color: "#d6d6d6 !important",
  },
  "body.reader-dark *": {
    color: "inherit !important",
    "background-color": "transparent !important",
    "border-color": "#3a3a3a !important",
  },
  "body.reader-dark a, body.reader-dark a *": {
    color: "#8ab4f8 !important",
  },
};

const themeClass = (theme) =>
  theme === "dark" ? "reader-dark" : "reader-light";

const EpubReader = ({ book, theme, save }) => {
  const [location, setLocation] = useState(book.cfi || null);
  const renditionRef = useRef(null); // Holds the EPUB engine
  // Until epub.js has measured the book we can't compute %, so keep the
  // last known value instead of saving 0%.
  const lastPct = useRef(Number(book.percentage) || 0);

  // Switch the book's colours when light / dark mode changes
  useEffect(() => {
    renditionRef.current?.themes.select(themeClass(theme));
  }, [theme]);

  const percentFor = (rendition, cfi) =>
    Math.round(rendition.book.locations.percentageFromCfi(cfi) * 100);

  const handleLocationChanged = (epubcifi) => {
    setLocation(epubcifi);

    const rendition = renditionRef.current;
    // If the background engine has finished generating the book's locations, do the math!
    if (rendition && rendition.book.locations.length() > 0) {
      lastPct.current = percentFor(rendition, epubcifi);
    }
    save(epubcifi, lastPct.current);
  };

  const handleRendition = (rendition) => {
    renditionRef.current = rendition;

    // Dark-mode styles for the book itself
    rendition.themes.default(BOOK_THEME_RULES);
    rendition.themes.select(themeClass(theme));

    // Tell the engine to map out the book in the background
    rendition.book.locations.generate(1600).then(() => {
      // This code runs ONLY when the background math is 100% finished
      if (renditionRef.current !== rendition) return;
      const liveLocation = rendition.currentLocation();
      if (liveLocation && liveLocation.start) {
        const currentCfi = liveLocation.start.cfi;
        lastPct.current = percentFor(rendition, currentCfi);
        save(currentCfi, lastPct.current);
      }
    });
  };

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <ReactReader
        url={book.file_url}
        location={location}
        locationChanged={handleLocationChanged}
        readerStyles={READER_STYLES}
        epubOptions={{ allowScriptedContent: true }}
        getRendition={handleRendition}
      />
    </div>
  );
};

export default EpubReader;
