import React from 'react';

const Loading = ({ isDarkMode }) => {
  return (
    <div className={`fixed inset-0 ${isDarkMode ? 'dark:bg-black' : 'bg-gray-200'} bg-opacity-70 flex justify-center items-center z-30`}>
      <div className={`animate-spin rounded-full h-32 w-32 border-b-2 ${isDarkMode ? 'dark:border-white' : 'border-gray-900'}`}></div>
    </div>
  );
};

export default Loading;
