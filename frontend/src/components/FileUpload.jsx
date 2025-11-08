import { useState, useRef } from 'react';
import { Upload, X, File, Image as ImageIcon, FileText } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function FileUpload({ taskId, attachments = [], onUploadSuccess, onDelete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    await handleFiles(files);
  };

  const handleFiles = async (files) => {
    if (!taskId) {
      toast.error('Task ID is required');
      return;
    }

    for (const file of files) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${file.name} is too large. Maximum size is 10MB.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('File uploaded successfully');
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
      toast.success('File deleted successfully');
      if (onDelete) {
        onDelete(attachmentId);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete file');
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return ImageIcon;
    }
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      return FileText;
    }
    return File;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileUrl = (filename) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${apiUrl.replace('/api', '')}/api/uploads/${filename}`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
        `}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Drag and drop files here, or click to select
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Supports images and documents (max 10MB)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.csv"
        />
      </div>

      {uploading && (
        <div className="text-center text-sm text-gray-500">
          Uploading...
        </div>
      )}

      {/* Attachments List */}
      {attachments && attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Attachments ({attachments.length})
          </h4>
          {attachments.map((attachment) => {
            const Icon = getFileIcon(attachment.mimeType);
            const isImage = attachment.mimeType.startsWith('image/');
            const fileUrl = getFileUrl(attachment.filename);

            return (
              <Card key={attachment._id} className="p-4">
                <div className="flex items-start gap-4">
                  {isImage ? (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      <img
                        src={fileUrl}
                        alt={attachment.originalName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {attachment.originalName}
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(attachment.size)}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        View
                      </a>
                      <a
                        href={fileUrl}
                        download
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(attachment._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

