# Personal E-Reader & Library Manager

A sleek, modern, dark-themed web application designed to act as a private digital bookshelf and reading platform. Built with React and powered by Supabase, this app allows users to upload, manage, and read their personal EPUB and PDF collections from anywhere.

## ✨ Features

- **Sleek Dark Mode UI:** A premium, distraction-free interface utilizing Google Material Symbols and a minimalist dashboard.
- **Smart File Processing:** Automatically extracts cover art and metadata directly from uploaded EPUBs and PDFs.
- **Dynamic Sorting:** Books are automatically sorted by `last_accessed_at`, pushing your most recently read or added books to the top of the shelf.
- **Visual Progress Tracking:** Sleek quarter-circle progress overlays on book covers to track reading completion.
- **Native Downloads:** Securely download your raw PDF or EPUB files directly from your cloud storage.
- **Private & Secure:** \* Powered by Supabase Authentication.
  - Strict Row Level Security (RLS) ensures users can only access their own files.
  - Registrations are currently locked to invite-only/single-owner.
- **Public Guest Shelf:** Allows visitors to view a curated selection of "guest" books without logging in.

## 🛠️ Tech Stack

- **Frontend:** React, Vite
- **Backend / Database:** Supabase (PostgreSQL, Storage, Auth)
- **File Processing:** `epubjs` (for EPUBs), `pdfjs` (for PDFs)
- **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js installed on your machine. You will also need a Supabase project set up.

### Installation

1. Clone the repository:
   git clone https://github.com/AdrianWWZ/e-library.git
   cd Library-App

2. Install the dependencies:
   npm install

3. Set up your environment variables:
   Create a .env file in the root directory and add your Supabase keys:

   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

4. Start the development server:
   npm run dev

## 🗄️ Database Schema

The app relies on a Supabase `Books` table with the following structure:

| Column Name        | Type      | Description                             |
| :----------------- | :-------- | :-------------------------------------- |
| `id`               | uuid      | Primary key                             |
| `created_at`       | timestamp | Automatically generated                 |
| `title`            | text      | Extracted from file metadata            |
| `author`           | text      | Extracted from file metadata            |
| `cover_url`        | text      | Public URL to the extracted cover image |
| `file_url`         | text      | Public URL to the actual book file      |
| `percentage`       | numeric   | Reading progress (0-100)                |
| `file_location`    | text      | Directory path (Default: 'Home')        |
| `owner`            | text      | The email of the user who uploaded it   |
| `last_accessed_at` | timestamp | Updates whenever a book is opened       |

### Storage Buckets

- `Books`: Stores the raw PDF and EPUB files.
- `Covers`: Stores the generated JPEG cover images.

## 🔒 Security & Authentication

This application uses Supabase Row Level Security (RLS) to ensure complete data privacy.

- **Private Shelves:** Database policies are configured to only allow `SELECT`, `INSERT`, `UPDATE`, and `DELETE` actions where the `owner` column matches the authenticated user's JWT email.
- **Public Display:** A read-only policy exception allows unauthenticated users to view books explicitly assigned to the `guest` owner.
