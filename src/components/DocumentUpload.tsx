import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface DocumentUploadProps {
  onUpload: (file: File, preview: string) => void;
  uploadedImage: string | null;
  onClear: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload, uploadedImage, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        onUpload(file, preview);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-purple-600" />
        Aadhar Card Upload
      </h3>

      {!uploadedImage ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            isDragging 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-300 hover:border-purple-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Drag and drop your Aadhar card image here, or click to select
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 
                       transition-colors duration-200 cursor-pointer inline-block font-medium"
          >
            Select Image
          </label>
        </div>
      ) : (
        <div className="relative">
          <img 
            src={uploadedImage} 
            alt="Uploaded Aadhar card"
            className="w-full max-w-md mx-auto rounded-lg shadow-md"
          />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full 
                       hover:bg-red-600 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;