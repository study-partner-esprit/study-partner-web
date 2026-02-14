import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { aiAPI, courseAPI, subjectAPI, gamificationAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import XPNotification from '../components/XPNotification';
import LevelUpModal from '../components/LevelUpModal';
import './CourseUpload.css';

const CourseUpload = () => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const [courseTitle, setCourseTitle] = useState('');
  const [subjectName, setSubjectName] = useState(location.state?.subjectName || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showXPNotification, setShowXPNotification] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);

  const handleSubjectChange = (e) => {
    const value = e.target.value;
    setSubjectName(value);
    
    // Find existing subject by name
    const existingSubject = subjects.find(s => s.name === value);
    if (existingSubject) {
      setSelectedSubjectId(existingSubject.id);
    } else {
      setSelectedSubjectId(''); // Will create new subject
    }
  };

  const ensureSubjectExists = async (subjectName) => {
    // Check if subject already exists
    const existingSubject = subjects.find(s => s.name === subjectName);
    if (existingSubject) {
      return existingSubject.id;
    }
    
    // Create new subject
    try {
      const formData = new FormData();
      formData.append('name', subjectName);
      formData.append('description', `${subjectName} subject`);
      formData.append('user_id', user._id);
      
      const response = await subjectAPI.create(formData);
      const newSubject = response.data.subject;
      
      // Add to subjects list
      setSubjects(prev => [...prev, newSubject]);
      
      return newSubject.id;
    } catch (error) {
      console.error('Failed to create subject:', error);
      throw new Error('Failed to create subject');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!courseTitle || !subjectName || files.length === 0) {
      setUploadStatus({ type: 'error', message: 'Please provide course title, subject, and at least one PDF file' });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      // Ensure subject exists
      const subjectId = await ensureSubjectExists(subjectName);

      const formData = new FormData();
      formData.append('title', courseTitle);
      formData.append('subject_id', subjectId);
      formData.append('user_id', user._id);
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await courseAPI.create(formData);
      
      // Award XP for course upload
      try {
        const xpResponse = await gamificationAPI.awardXP({
          action: 'course_upload',
          metadata: {
            course_title: courseTitle,
            subject_name: subjectName,
            file_count: files.length
          }
        });
        
        // Show XP notification
        setXpAwarded(xpResponse.xp_awarded);
        setShowXPNotification(true);
        
        // Show level-up modal if leveled up
        if (xpResponse.leveled_up) {
          setLevelUpData({
            newLevel: xpResponse.new_level,
            totalXP: xpResponse.total_xp
          });
          // Delay level-up modal to show after XP notification
          setTimeout(() => {
            setShowLevelUpModal(true);
          }, 3500);
        }
      } catch (xpError) {
        console.error('Failed to award XP:', xpError);
        // Don't block upload success if XP fails
      }
      
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
      const response = await subjectAPI.list();
      {/* XP Notification */}
      <XPNotification
        xpAwarded={xpAwarded}
        visible={showXPNotification}
        onComplete={() => setShowXPNotification(false)}
      />

      {/* Level-Up Modal */}
      {levelUpData && (
        <LevelUpModal
          visible={showLevelUpModal}
          newLevel={levelUpData.newLevel}
          totalXP={levelUpData.totalXP}
          onClose={() => setShowLevelUpModal(false)}
        />
      )}

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
      const response = await courseAPI.list();
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
              onChange={handleSubjectChange}
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
