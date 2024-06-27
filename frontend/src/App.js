import React from 'react';
import FileUploadForm from './components/FileUploadForm';
import FileList from './components/FileList';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Video and Audio Upload App</h1>
      <FileUploadForm />
      <FileList />
      <ToastContainer />
    </div>
  );
}

export default App;
