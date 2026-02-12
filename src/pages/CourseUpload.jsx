import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { aiAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import './CourseUpload.css';

const CourseUpload = () => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const [courseTitle, setCourseTitle] = useState('');
  const [subjectName, setSubjectName] = useState(location.state?.subjectName || 'General');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!courseTitle || files.length === 0) {
      setUploadStatus({ type: 'error', message: 'Please provide course title and at least one PDF file' });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('course_title', courseTitle);
      formData.append('subject_name', subjectName);
      formData.append('user_id', user._id);
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await aiAPI.ingestCourse(formData);
      
      setUploadStatus({
        type: 'success',
        message: response.data.message || 'Course uploaded successfully'
      });
      
      // Reset form
      setCourseTitle('');
      setFiles([]);
      document.getElementById('file-input').value = '';
      
      // Refresh lists
      loadSubjects();
      loadCourses();
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to upload course'
      });
    } finally {
      setUploading(false);
    }
  };

  const loadSubjects = async () => {
    if (!user?._id) return;
    try {
      const response = await aiAPI.listSubjects(user._id);
      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  const loadCourses = async () => {
    if (!user?._id) {
      console.warn('User ID not available, skipping course load');
      return;
    }
    try {
      const response = await aiAPI.listCourses(user._id);
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  // Load subjects and courses on mount
  useEffect(() => {
    if (user) {
      loadSubjects();
      loadCourses();
    }
  }, [user]);

  return (
    <div className="course-upload-container">
      <h1>Course Material Upload</h1>
      <p className="subtitle">Upload your course PDFs to generate personalized study plans</p>

      <div className="upload-section">
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="course-title">Course Title</label>
            <input
              id="course-title"
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="e.g., Linear Algebra, Thermodynamics"
              disabled={uploading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject-name">Subject</label>
            <input
              id="subject-name"
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g., Mathematics, Physics, Computer Science"
              disabled={uploading}
              list="subject-suggestions"
            />
            <datalist id="subject-suggestions">
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.name} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label htmlFor="file-input">PDF Files</label>
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.txt"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {files.length > 0 && (
              <div className="file-list">
                <p><strong>{files.length} file(s) selected:</strong></p>
                <ul>
                  {files.map((file, idx) => (
                    <li key={idx}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button type="submit" disabled={uploading} className="upload-btn">
            {uploading ? 'Processing...' : 'Upload Course'}
          </button>
        </form>

        {uploadStatus && (
          <div className={`upload-status ${uploadStatus.type}`}>
            {uploadStatus.message}
          </div>
        )}
      </div>

      <div className="courses-section">
        <h2>Your Courses</h2>
        {courses.length === 0 ? (
          <p className="no-courses">No courses uploaded yet</p>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <h3>{course.title}</h3>
                <p className="course-subject">Subject: {course.subject_name}</p>
                <p className="course-date">
                  Uploaded: {new Date(course.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseUpload;
