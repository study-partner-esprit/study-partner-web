import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, FileText, Check, AlertCircle } from 'lucide-react';
import { aiAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import './UploadModal.css';

const UploadModal = ({ isOpen, onClose, onUploadComplete, preSelectedSubject = null }) => {
  const user = useAuthStore((state) => state.user);
  const [courseTitle, setCourseTitle] = useState('');
  const [subjectName, setSubjectName] = useState(preSelectedSubject || '');
  const [subjectImage, setSubjectImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (preSelectedSubject) {
      setSubjectName(preSelectedSubject);
    }
  }, [preSelectedSubject]);

  useEffect(() => {
    if (!isOpen) {
      // Reset form on close
      setCourseTitle('');
      if (!preSelectedSubject) setSubjectName('');
      setSubjectImage(null);
      setImagePreview(null);
      setFiles([]);
      setError(null);
    }
  }, [isOpen, preSelectedSubject]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSubjectImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseTitle || !subjectName || files.length === 0) {
      setError("Please fill in all required fields and upload at least one PDF.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('course_title', courseTitle);
      formData.append('subject_name', subjectName);
      formData.append('user_id', user._id);
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      if (subjectImage) {
        formData.append('subject_image', subjectImage);
      }

      await aiAPI.ingestCourse(formData);
      onUploadComplete();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to upload course. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="modal-container"
        >
          <div className="modal-header">
            <h2>Add New Course</h2>
            <button onClick={onClose} className="close-btn">
              <X size={24} />
            </button>
          </div>

          <div className="modal-content">
            <div className="form-group">
              <label>Course Title</label>
              <input 
                type="text" 
                placeholder="e.g. Advanced Calculus II"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="modal-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mathematics"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="modal-input"
                  disabled={!!preSelectedSubject}
                />
              </div>
              
              <div className="form-group image-upload-group">
                <label>Cover Image (Optional)</label>
                <div 
                  className="image-upload-box"
                  onClick={() => imageInputRef.current?.click()}
                  style={imagePreview ? { backgroundImage: `url(${imagePreview})` } : {}}
                >
                  {!imagePreview && <ImageIcon size={20} />}
                  <input 
                    type="file" 
                    ref={imageInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Course Materials (PDF)</label>
              <div 
                className={`file-drop-zone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={32} />
                <p>Drag & drop PDFs here or click to browse</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  multiple 
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {files.length > 0 && (
              <div className="file-list">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <FileText size={16} />
                    <span className="file-name">{file.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeFile(index); }} className="remove-file">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button onClick={onClose} className="cancel-btn">Cancel</button>
            <button 
              onClick={handleSubmit} 
              className="confirm-btn"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="spinner-small"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Add to Library
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UploadModal;
