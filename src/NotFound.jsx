import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-500 transition duration-300"
      >
        Back to Home
      </Link>
    </div>
  );
}

export default NotFound;
