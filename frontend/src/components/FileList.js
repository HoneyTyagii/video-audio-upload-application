import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FileList = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/files');
        setFiles(response.data);
      } catch (error) {
        console.error('Error fetching files', error);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Uploaded Files</h2>
      <ul>
        {files.map((file) => (
          <li key={file._id} className="mb-4 p-4 bg-white rounded shadow-md">
            <p className="font-bold">Title: {file.title}</p>
            <p>Description: {file.description}</p>
            <a href={file.s3Url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              View File
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
