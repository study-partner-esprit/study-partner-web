import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subjectAPI, courseAPI, studyPlanAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { BookOpen, ArrowLeft, FileText, Calendar, Plus, Upload, X, AlertCircle, Eye, Download, Sparkles } from 'lucide-react';
import UploadModal from '../components/UploadModal';
import './SubjectDetail.css';

// Add Files Modal Component
const AddFilesModal = ({ isOpen, onClose, onUploadComplete, course }) => {
  const user = useAuthStore((state) => state.user);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setError(null);
    }
  }, [isOpen]);

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

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please upload at least one PDF file.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      await courseAPI.addFiles(course.id, formData);
      onUploadComplete();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Files to "{course.title}"</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          <div className="form-group">
            <label>Additional Course Materials (PDF)</label>
            <div 
              className={`file-drop-zone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input-add').click()}
            >
              <Upload size={48} />
              <p>Drag & drop PDF files here, or click to browse</p>
              <input
                id="file-input-add"
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {files.length > 0 && (
            <div className="file-list">
              <h4>Files to Add:</h4>
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <FileText size={20} />
                  <span>{file.name}</span>
                  <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  <button onClick={() => removeFile(index)} className="remove-file">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button onClick={onClose} className="cancel-btn" disabled={uploading}>
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              className="upload-btn" 
              disabled={uploading || files.length === 0}
            >
              {uploading ? 'Adding Files...' : `Add ${files.length} File${files.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Course Detail Modal Component
const CourseDetailModal = ({ isOpen, onClose, course, onAddFiles }) => {
  if (!isOpen || !course) return null;

  const handleDownload = (file) => {
    // For now, we'll just show an alert since files are processed and removed
    // In a production system, you'd store files permanently and provide download links
    alert(`Download functionality for ${file.originalName} would be implemented here. Files are currently processed and removed after AI analysis.`);
  };

  const handleView = (file) => {
    // For PDFs, we could open in a new tab or embed a viewer
    // Since files are removed after processing, this is a placeholder
    alert(`View functionality for ${file.originalName} would be implemented here. In a full implementation, files would be stored permanently.`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container course-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{course.title}</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {course.description && (
            <div className="course-description">
              <h3>Description</h3>
              <p>{course.description}</p>
            </div>
          )}

          <div className="course-info">
            <div className="info-item">
              <span className="label">Status:</span>
              <span className={`status-badge ${course.status}`}>{course.status}</span>
            </div>
            <div className="info-item">
              <span className="label">Files:</span>
              <span>{course.files?.length || 0} documents</span>
            </div>
            <div className="info-item">
              <span className="label">Topics:</span>
              <span>{course.topics?.length || 0} topics</span>
            </div>
            {course.processedAt && (
              <div className="info-item">
                <span className="label">Last Processed:</span>
                <span>{new Date(course.processedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="course-files">
            <div className="files-header">
              <h3>Course Documents</h3>
              <button className="add-files-btn" onClick={() => { onClose(); onAddFiles(course); }}>
                <Upload size={16} />
                Add More Files
              </button>
            </div>

            {course.files && course.files.length > 0 ? (
              <div className="files-list">
                {course.files.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-icon">
                      <FileText size={24} />
                    </div>
                    <div className="file-info">
                      <div className="file-name">{file.originalName}</div>
                      <div className="file-meta">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • 
                        Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="file-actions">
                      <button 
                        className="file-action-btn view-btn" 
                        onClick={() => handleView(file)}
                        title="View Document"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="file-action-btn download-btn" 
                        onClick={() => handleDownload(file)}
                        title="Download Document"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-files">
                <FileText size={48} />
                <p>No documents uploaded yet</p>
                <button className="add-files-btn" onClick={() => { onClose(); onAddFiles(course); }}>
                  <Upload size={16} />
                  Upload Documents
                </button>
              </div>
            )}
          </div>

          {course.topics && course.topics.length > 0 && (
            <div className="course-topics">
              <h3>Course Topics</h3>
              <div className="topics-list">
                {course.topics.map((topic, index) => (
                  <div key={index} className="topic-item">
                    <h4>{topic.title}</h4>
                    {topic.subtopics && topic.subtopics.length > 0 && (
                      <div className="subtopics">
                        {topic.subtopics.slice(0, 3).map((subtopic, subIndex) => (
                          <div key={subIndex} className="subtopic">
                            {subtopic.title}
                          </div>
                        ))}
                        {topic.subtopics.length > 3 && (
                          <div className="more-subtopics">
                            +{topic.subtopics.length - 3} more subtopics
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SubjectDetail = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [subject, setSubject] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseForFiles, setSelectedCourseForFiles] = useState(null);
  const [isAddFilesModalOpen, setIsAddFilesModalOpen] = useState(false);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState(null);
  const [isCourseDetailModalOpen, setIsCourseDetailModalOpen] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState({});

  useEffect(() => {
    if (user && subjectId) {
      loadSubjectData();
    }
  }, [user, subjectId]);

  const loadSubjectData = async () => {
    if (!user?._id) return;
    try {
      // Load subject info
      const subjectResponse = await subjectAPI.get(subjectId);
      setSubject(subjectResponse.data.subject);

      // Load courses for this subject
      const coursesResponse = await courseAPI.list(subjectId);
      setCourses(coursesResponse.data.courses || []);
    } catch (error) {
      console.error('Failed to load subject data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/subjects');
  };

  const handleAddFiles = (course) => {
    setSelectedCourseForFiles(course);
    setIsAddFilesModalOpen(true);
  };

  const handleViewCourse = async (course) => {
    try {
      const response = await courseAPI.get(course.id);
      setSelectedCourseForDetail(response.data.course);
      setIsCourseDetailModalOpen(true);
    } catch (error) {
      console.error('Failed to load course details:', error);
    }
  };

  const handleAddFilesComplete = () => {
    loadSubjectData();
    setIsAddFilesModalOpen(false);
    setSelectedCourseForFiles(null);
  };

  const handleGeneratePlan = async (course) => {
    if (course.status !== 'completed') {
      alert('Course is still being processed. Please wait until processing is complete.');
      return;
    }

    const goal = prompt(`What do you want to learn from "${course.title}"?`, `Master all concepts in ${course.title}`);
    
    if (!goal) return;

    const availableTime = prompt('How many minutes do you have available for studying?', '240');
    
    if (!availableTime) return;

    setGeneratingPlan(prev => ({ ...prev, [course.id]: true }));

    try {
      const response = await studyPlanAPI.create({
        goal: goal,
        availableTimeMinutes: parseInt(availableTime),
        courseId: course.id,
        startDate: new Date().toISOString()
      });

      const message = response.data.plan.warning 
        ? `Study plan created successfully with ${response.data.plan.tasksCount} tasks!\n\nNote: ${response.data.plan.warning}`
        : `Study plan created successfully with ${response.data.plan.tasksCount} tasks!`;
      
      alert(message);
      navigate('/planner');
    } catch (error) {
      console.error('Failed to generate plan:', error);
      const errorMessage = error.response?.data?.error || 'Failed to generate study plan. Please try again.';
      const errorDetails = error.response?.data?.details ? `\n\nDetails: ${error.response.data.details}` : '';
      alert(errorMessage + errorDetails);
    } finally {
      setGeneratingPlan(prev => ({ ...prev, [course.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="subject-detail-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="subject-detail-container">
        <div className="empty-state">
          <p>Subject not found</p>
          <button onClick={handleBack}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="subject-detail-container">
      {/* Sidebar */}
      <div className="subject-sidebar">
        <button className="back-btn" onClick={handleBack}>
          <ArrowLeft size={20} />
          <span>All Subjects</span>
        </button>

        <div className="subject-info">
          <div className="subject-icon-large">
            <BookOpen size={48} />
          </div>
          <h2>{subject.name}</h2>
          <p className="course-count-badge">
            {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
          </p>
        </div>

        <div className="sidebar-actions">
          <button className="add-course-btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            Add Course
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="subject-content">
        <div className="content-header">
          <h1>Courses in {subject.name}</h1>
        </div>

        {courses.length === 0 ? (
          <div className="empty-courses">
            <FileText size={64} />
            <h3>No courses yet</h3>
            <p>Add your first course to this subject</p>
            <button className="cta-btn" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} />
              Upload Course
            </button>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <div className="course-icon">
                    <FileText size={32} />
                  </div>
                  <div className="course-status">
                    <span className="status-badge">{course.status}</span>
                  </div>
                </div>
                <div className="course-body">
                  <h3>{course.title}</h3>
                  <div className="course-meta">
                    <span className="meta-item">
                      <Calendar size={14} />
                      {new Date(course.uploaded_at).toLocaleDateString()}
                    </span>
                    <span className="meta-item">
                      <FileText size={14} />
                      {course.filesCount || 0} {course.filesCount === 1 ? 'file' : 'files'}
                    </span>
                  </div>
                </div>
                <div className="course-footer">
                  <button className="view-btn" onClick={() => handleViewCourse(course)}>
                    <Eye size={16} />
                    View Details
                  </button>
                  {course.status === 'completed' && (
                    <button 
                      className="generate-plan-btn" 
                      onClick={() => handleGeneratePlan(course)}
                      disabled={generatingPlan[course.id]}
                    >
                      <Sparkles size={16} />
                      {generatingPlan[course.id] ? 'Generating...' : 'Generate Plan'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUploadComplete={loadSubjectData}
        subjectId={subjectId}
        subjectName={subject?.name}
      />

      {/* Add Files Modal */}
      {isAddFilesModalOpen && selectedCourseForFiles && (
        <AddFilesModal
          isOpen={isAddFilesModalOpen}
          onClose={() => {
            setIsAddFilesModalOpen(false);
            setSelectedCourseForFiles(null);
          }}
          onUploadComplete={handleAddFilesComplete}
          course={selectedCourseForFiles}
        />
      )}

      {/* Course Detail Modal */}
      {isCourseDetailModalOpen && selectedCourseForDetail && (
        <CourseDetailModal
          isOpen={isCourseDetailModalOpen}
          onClose={() => {
            setIsCourseDetailModalOpen(false);
            setSelectedCourseForDetail(null);
          }}
          course={selectedCourseForDetail}
          onAddFiles={handleAddFiles}
        />
      )}
    </div>
  );
};

export default SubjectDetail;
