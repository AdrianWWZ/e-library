import { useState } from "react";
import { supabase } from "../config/supabaseClient";
import MenuItem from "./MenuItem";
import { getStorageFileName, isStoredCover } from "../utils/books";

const DeleteButton = ({ book, onRefresh, onCloseMenu }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevents file from opening when click delete
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${book.title}"?`,
    );

    if (!confirmDelete) {
      if (onCloseMenu) onCloseMenu();
      return;
    }

    try {
      setIsDeleting(true);

      // 1. Delete the row from the Database FIRST.
      //    .select() returns the deleted rows - if Row Level Security blocked
      //    the delete we get an empty list, and we stop before touching files.
      const { data: deleted, error: dbError } = await supabase
        .from("Books")
        .delete()
        .eq("id", book.id)
        .select("id");
      if (dbError) throw dbError;
      if (!deleted || deleted.length === 0) {
        throw new Error("You don't have permission to delete this book.");
      }

      // 2. Delete the file from the Storage Bucket
      const { error: storageError } = await supabase.storage
        .from("Books")
        .remove([getStorageFileName(book.file_url)]);
      if (storageError)
        console.error("File cleanup failed:", storageError.message);

      // 3. Delete Cover Image from Storage Bucket
      if (isStoredCover(book)) {
        const { error: coverError } = await supabase.storage
          .from("Covers")
          .remove([getStorageFileName(book.cover_url)]);
        if (coverError)
          console.error("Cover cleanup failed:", coverError.message);
      }

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error deleting book:", error.message);
      alert(`Failed to delete the book. ${error.message || ""}`);
    } finally {
      setIsDeleting(false);
      if (onCloseMenu) onCloseMenu();
    }
  };

  return (
    <MenuItem icon="delete" danger onClick={handleDelete} busy={isDeleting}>
      {isDeleting ? "Deleting..." : "Delete"}
    </MenuItem>
  );
};

export default DeleteButton;
