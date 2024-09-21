import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Ilustrasi */}
      <img
        src="https://via.placeholder.com/400x300?text=Oops!+404"
        alt="404 Illustration"
        className="w-96 h-auto mb-8 animate-bounce"
      />

      {/* Pesan 404 */}
      <h1 className="text-8xl font-bold text-blue-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        Oops! Page Not Found
      </h2>
      <p className="text-lg text-gray-500 mb-8 max-w-lg text-center">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Please check the URL or return to the homepage.
      </p>

      {/* Tombol kembali */}
      <Link
        to="/"
        className="inline-block bg-blue-600 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-lg hover:bg-blue-500 transition duration-300 transform hover:scale-105"
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default NotFound;
