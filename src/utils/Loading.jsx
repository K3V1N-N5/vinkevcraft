import React from 'react';

const Loading = () => {
  return (
    <div className="fixed inset-0 bg-gray-200 dark:bg-black bg-opacity-70 flex justify-center items-center z-30">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
    </div>
  );
};

export default Loading;
