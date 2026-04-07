import { useState } from "react";
import { supabase } from "../config/supabaseClient";

const DeleteButton = ({ book, onRefresh, onCloseMenu }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

      // 1. Extract raw filename from the end of the Supabase URL
      const fileName = decodeURIComponent(book.file_url.split("/").pop());

      // 2. Delete the file from the Storage Bucket
      const { error: storageError } = await supabase.storage
        .from("Books")
        .remove([fileName]);
      if (storageError) throw storageError;

      // 3. Delete Cover Image from Storage Bucket
      if (book.cover_url && !book.cover_url.includes("via.placeholder.com")) {
        const coverName = decodeURIComponent(book.cover_url.split("/").pop());
        const { error: coverError } = await supabase.storage
          .from("Covers")
          .remove([coverName]);
        if (coverError) throw coverError;
      }

      // 4. Delete the text row from the Database
      const { error: dbError } = await supabase
        .from("Books")
        .delete()
        .eq("id", book.id);
      if (dbError) throw dbError;

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error deleting book:", error.message);
      alert("Failed to delete the book.");
    } finally {
      setIsDeleting(false);
      if (onCloseMenu) onCloseMenu();
    }
  };

  return (
    <button
      onClick={handleDelete}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isDeleting}
      style={{
        display: "block",
        width: "100%",
        padding: "10px 16px",
        textAlign: "left",
        border: "none",
        color: "#ff4d4f",
        fontSize: "0.9rem",
        transition: "background-color 0.2s",
        backgroundColor: isHovered ? "#3a1616" : "transparent",
        cursor: isDeleting ? "wait" : "pointer",
      }}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
};

export default DeleteButton;
