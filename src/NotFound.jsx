import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-[#1e1e1e]">
      {/* Teks 404 Besar */}
      <h1 className="text-9xl font-extrabold text-blue-600 mb-4 animate-pulse dark:text-blue-400">404</h1>

      {/* Pesan */}
      <h2 className="text-3xl font-semibold text-gray-700 mb-4 dark:text-gray-300">
        Page Not Found
      </h2>

      <p className="text-lg text-gray-500 mb-8 max-w-md text-center dark:text-gray-400">
        The page you're looking for doesn't exist. It might have been removed, renamed, or is temporarily unavailable. Please try going back to the homepage.
      </p>

      {/* Tombol Kembali */}
      <Link
        to="/"
        className="inline-block bg-blue-600 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-lg hover:bg-blue-500 transition duration-300 transform hover:scale-105 dark:bg-blue-700 dark:hover:bg-blue-600"
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default NotFound;
