import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "./config/supabaseClient";
import { useSettings } from "./context/settings";
import {
  DEFAULT_FILTERS,
  filterAndSortBooks,
  hasActiveFilters,
} from "./utils/books";

import ReaderView from "./components/ReaderView";
import Library from "./components/Library";
import Dashboard from "./components/Dashboard";
import FilterBar from "./components/FilterBar";
import AuthModal from "./components/AuthModal";
import EditBookModal from "./components/EditBookModal";

function App() {
  const { showProgress, sort, setSort } = useSettings();

  const [currentBook, setCurrentBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true); // first load only
  const [refreshing, setRefreshing] = useState(false); // refresh button spinner

  // Auth states
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Filter / rename states
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [renamingBook, setRenamingBook] = useState(null);

  const userEmail = user?.email ?? null;

  // Check auth status on load and listen for changes.
  // onAuthStateChange fires straight away with the saved session, so we wait
  // for it before loading books (stops the guest shelf flashing on refresh).
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Refresh Library Display List Function
  const refreshLibrary = useCallback(async () => {
    try {
      setRefreshing(true);

      let query = supabase
        .from("Books")
        .select("*")
        .order("last_accessed_at", { ascending: false });

      if (!userEmail) {
        // If NOT logged in, fetch books owned by "guest"
        query = query.eq("owner", "guest");
      } else {
        // If logged in, fetch books owned by user's email
        query = query.ilike("owner", userEmail);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error("Error fetching books:", error.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [userEmail]);

  // Load books once we know who's logged in (and again if that changes)
  useEffect(() => {
    if (!authReady) return;
    refreshLibrary();
  }, [authReady, refreshLibrary]);

  // Update one book in the list without re-downloading everything
  const updateBookLocally = useCallback((id, changes) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...changes } : b)),
    );
  }, []);

  const handleOpenBook = (book) => {
    // 1. Open the book
    setCurrentBook(book);

    // 2. Move it to the top of "Recently opened"
    const now = new Date().toISOString();
    updateBookLocally(book.id, { last_accessed_at: now });

    // 3. Tell database to update the last_accessed_at (owners only)
    if (!user) return;
    supabase
      .from("Books")
      .update({ last_accessed_at: now })
      .eq("id", book.id)
      .then(({ error }) => {
        if (error) console.error("Failed to update access time:", error);
      });
  };

  const visibleBooks = useMemo(
    () => filterAndSortBooks(books, filters, sort),
    [books, filters, sort],
  );
  const filtersActive = hasActiveFilters(filters);

  // If a book is selected, show the ReaderView
  if (currentBook) {
    return (
      <ReaderView
        book={currentBook}
        canSave={!!user}
        onProgress={updateBookLocally}
        onBack={() => setCurrentBook(null)}
      />
    );
  }

  // Otherwise, show main Library screen
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* Show AuthModal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Rename dialog */}
      {renamingBook && (
        <EditBookModal
          book={renamingBook}
          onClose={() => setRenamingBook(null)}
          onSaved={(updated) =>
            updateBookLocally(updated.id, {
              title: updated.title,
              author: updated.author,
            })
          }
        />
      )}

      <Dashboard
        onRefresh={refreshLibrary}
        refreshing={refreshing}
        user={user}
        books={books}
        onLoginClick={() => setShowAuthModal(true)}
        filterOpen={filterOpen}
        filtersActive={filtersActive}
        onToggleFilter={() => setFilterOpen((open) => !open)}
      />

      {filterOpen && (
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(DEFAULT_FILTERS)}
          sort={sort}
          onSortChange={setSort}
          shown={visibleBooks.length}
          total={books.length}
        />
      )}

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
          books={visibleBooks}
          totalCount={books.length}
          loading={loading}
          canEdit={!!user}
          showProgress={showProgress}
          onSelectBook={handleOpenBook}
          onRefresh={refreshLibrary}
          onRename={setRenamingBook}
          onClearFilters={() => setFilters(DEFAULT_FILTERS)}
        />
      </div>
    </div>
  );
}

export default App;
