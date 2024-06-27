import React from 'react';

const ProgressBar = ({ progress }) => {
  return (
    <div className="my-4">
      <div className="w-full bg-gray-200 rounded-full">
        <div
          className="bg-blue-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
          style={{ width: `${progress}%` }}
        >
          {progress.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
