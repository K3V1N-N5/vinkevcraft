import React, { useState, useEffect } from 'react';

const Loading = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Ambil preferensi tema dari localStorage
    const savedTheme = JSON.parse(localStorage.getItem('isDarkMode'));
    if (savedTheme !== null) {
      setIsDarkMode(savedTheme);
    }
  }, []);

  return (
    <div
      className={`fixed inset-0 ${
        isDarkMode ? 'bg-black bg-opacity-70' : 'bg-gray-200 bg-opacity-70'
      } flex justify-center items-center z-30`}
    >
      <div
        className={`animate-spin rounded-full h-32 w-32 border-b-2 ${
          isDarkMode ? 'border-white' : 'border-gray-900'
        }`}
      ></div>
    </div>
  );
};

export default Loading;
