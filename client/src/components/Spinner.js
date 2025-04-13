// college-portal/client/src/components/Spinner.js
import React from "react";

const Spinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-50">
      <div
        className="w-12 h-12 border-4 border-t-blue-500 border-b-purple-500 border-l-transparent border-r-transparent rounded-full animate-spin"
      ></div>
    </div>
  );
};

export default Spinner;