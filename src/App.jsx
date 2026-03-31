import React, { useState, useEffect } from "react";
import ReaderView from "./components/ReaderView";
import UploadButton from "./components/UploadButton";
import Library from "./components/Library";
import { supabase } from "./config/supabaseClient";

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
        .order("id", { ascending: false });

      if (error) throw error;
      setBooks(data);
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

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "10px 20px",
          backgroundColor: "#eee",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>E-Reader</h1>
        {currentBook && (
          <button
            onClick={() => {
              setCurrentBook(null); // Close the reader view
              refreshLibrary();
            }}
            style={{ padding: "5px 10px" }}
          >
            Back to Library
          </button>
        )}
      </div>

      <div
        style={{
          position: "relative",
          flexGrow: 1,
          width: "100%",
          overflowY: "auto",
        }}
      >
        {currentBook ? (
          <ReaderView book={currentBook} />
        ) : (
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <UploadButton onRefresh={refreshLibrary} />
            <Library
              books={books}
              loading={loading}
              onSelectBook={setCurrentBook}
              onRefresh={refreshLibrary}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
