import { useCallback, useEffect, useRef } from "react";
import { supabase } from "../config/supabaseClient";

/*
  Saves reading progress to Supabase, at most once per second.

  Differences from the old version:
  - The last pending save is *flushed* (not thrown away) when you leave the
    book, hide the tab or close the page - so a quick page turn followed by
    "Back to Library" is no longer lost.
  - Guests (not logged in) don't write to the database.
  - The library list is updated straight away via onProgress, so the % badge
    is correct when you go back without re-downloading the whole list.
*/
export const useProgressSaver = (bookId, { enabled, onProgress }) => {
  const pending = useRef(null);
  const timer = useRef(null);
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onProgressRef.current = onProgress;
  });

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    timer.current = null;
    const next = pending.current;
    if (!next) return;
    pending.current = null;

    try {
      const { error } = await supabase
        .from("Books")
        .update({ cfi: next.location, percentage: next.percentage })
        .eq("id", bookId);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to save progress:", err.message);
    }
  }, [bookId]);

  const save = useCallback(
    (location, percentage) => {
      const loc = String(location);
      onProgressRef.current?.(bookId, { cfi: loc, percentage });
      if (!enabled) return;

      pending.current = { location: loc, percentage };
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, 1000); // 1 second delay
    },
    [bookId, enabled, flush],
  );

  // Flush when the tab is hidden / closed, and when the reader closes
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [flush]);

  return save;
};
