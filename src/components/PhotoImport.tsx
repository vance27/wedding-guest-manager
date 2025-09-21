"use client";

import { useState, useRef } from "react";
import { Upload, X, Check, AlertCircle, Camera } from "lucide-react";

interface PhotoImportProps {
  onImportComplete: () => void;
  onCancel: () => void;
}

export function PhotoImport({ onImportComplete, onCancel }: PhotoImportProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadResults, setUploadResults] = useState<Record<string, 'success' | 'error'>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const jpgFiles = files.filter(file =>
      file.type === 'image/jpeg' ||
      file.type === 'image/jpg' ||
      file.name.toLowerCase().endsWith('.jpg') ||
      file.name.toLowerCase().endsWith('.jpeg')
    );

    setSelectedFiles(prev => [...prev, ...jpgFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File): Promise<boolean> => {
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      return response.ok;
    } catch (error) {
      console.error('Upload error:', error);
      return false;
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress({});
    setUploadResults({});

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileKey = `${file.name}-${i}`;

      setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));

      try {
        const success = await uploadFile(file);
        setUploadResults(prev => ({
          ...prev,
          [fileKey]: success ? 'success' : 'error'
        }));
        setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
      } catch (error) {
        setUploadResults(prev => ({ ...prev, [fileKey]: 'error' }));
        setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
      }
    }

    setUploading(false);

    // Check if all uploads were successful
    const allSuccess = Object.values(uploadResults).every(result => result === 'success');
    if (allSuccess) {
      setTimeout(() => {
        onImportComplete();
      }, 1000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalFiles = selectedFiles.length;
  const completedUploads = Object.keys(uploadResults).length;
  const successfulUploads = Object.values(uploadResults).filter(result => result === 'success').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Import Photos</h2>
          <button
            onClick={onCancel}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!uploading && selectedFiles.length === 0 && (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-600 text-lg mb-2">
              Click to select JPG photos
            </div>
            <div className="text-gray-400 text-sm">
              You can select multiple files at once
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,image/jpeg"
          onChange={handleFileSelect}
          className="hidden"
        />

        {selectedFiles.length > 0 && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                {totalFiles} file{totalFiles !== 1 ? 's' : ''} selected
                {uploading && (
                  <span className="ml-2">
                    ({completedUploads}/{totalFiles} processed)
                  </span>
                )}
              </div>
              {!uploading && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Add More
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
              <div className="divide-y divide-gray-200">
                {selectedFiles.map((file, index) => {
                  const fileKey = `${file.name}-${index}`;
                  const progress = uploadProgress[fileKey] || 0;
                  const result = uploadResults[fileKey];

                  return (
                    <div key={fileKey} className="p-3 flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Camera className="w-5 h-5 text-gray-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </div>

                        {uploading && fileKey in uploadProgress && (
                          <div className="mt-1">
                            <div className="bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        {result === 'success' && (
                          <Check className="w-5 h-5 text-green-600" />
                        )}
                        {result === 'error' && (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        {!uploading && !result && (
                          <button
                            onClick={() => removeFile(index)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {uploading ? (
                <span>Uploading photos...</span>
              ) : completedUploads > 0 ? (
                <span className="text-green-600">
                  {successfulUploads} of {totalFiles} photos uploaded successfully
                </span>
              ) : null}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                disabled={uploading}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              {!uploading && completedUploads === 0 && (
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload {totalFiles} Photo{totalFiles !== 1 ? 's' : ''}
                </button>
              )}
              {completedUploads > 0 && successfulUploads === totalFiles && (
                <button
                  onClick={onImportComplete}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}