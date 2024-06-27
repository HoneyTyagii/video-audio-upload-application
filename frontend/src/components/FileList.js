import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FileList = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await axios.get('http://localhost:5000/files');
      setFiles(response.data);
    };

    fetchFiles();
  }, []);

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg mt-8">
      <h2 className="text-lg font-bold mb-4">Uploaded Files</h2>
      <ul>
        {files.map((file) => (
          <li key={file._id} className="mb-4">
            <h3 className="text-md font-semibold">{file.title}</h3>
            <p className="text-sm text-gray-600">{file.description}</p>
            <a
              href={`https://s3.amazonaws.com/${file.s3Key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
