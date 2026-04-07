import { useState, useEffect } from "react";
import { supabase } from "./config/supabaseClient";

import ReaderView from "./components/ReaderView";
import Library from "./components/Library";
import Dashboard from "./components/Dashboard";

function App() {
  const [currentBook, setCurrentBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refresh Library Display List Function
  const refreshLibrary = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("Books")
        .select("*")
        .order("last_accessed_at", { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error("Error fetching books:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh when app loads
  useEffect(() => {
    refreshLibrary();
  }, []);

  const handleOpenBook = async (book) => {
    // 1. Open the book
    setCurrentBook(book);

    // 2. Tell database to update the last_accessed_at
    try {
      const { error } = await supabase
        .from("Books")
        .update({ last_accessed_at: new Date().toISOString() })
        .eq("id", book.id);

      if (error) throw error;

      refreshLibrary();
    } catch (error) {
      console.error("Failed to update access time:", error);
    }
  };

  // If a book is selected, show the ReaderView
  if (currentBook) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#121212",
        }}
      >
        <div
          style={{
            padding: "10px 20px ",
            backgroundColor: "#1a1a1a",
            borderBottom: "1px solid #333",
          }}
        >
          <button
            onClick={() => setCurrentBook(null)}
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "#e0e0e0",
              border: "1px solid #555",
              borderRadius: "6px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#333")}
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
          >
            ← Back to Library
          </button>
        </div>
        <ReaderView book={currentBook} />
      </div>
    );
  }

  // Otherwise, show main Library screen
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Dashboard onRefresh={refreshLibrary} />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Library
          books={books}
          loading={loading}
          onSelectBook={handleOpenBook}
          onRefresh={refreshLibrary}
        />
      </div>
    </div>
  );
}

export default App;
