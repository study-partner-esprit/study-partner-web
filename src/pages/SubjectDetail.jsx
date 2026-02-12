import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { aiAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { BookOpen, ArrowLeft, FileText, Calendar, Plus } from 'lucide-react';
import UploadModal from '../components/UploadModal';
import './SubjectDetail.css';

const SubjectDetail = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [subject, setSubject] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user && subjectId) {
      loadSubjectData();
    }
  }, [user, subjectId]);

  const loadSubjectData = async () => {
    if (!user?._id) return;
    try {
      // Load subject info
      const subjectsResponse = await aiAPI.listSubjects(user._id);
      const foundSubject = subjectsResponse.data.subjects.find(s => s.id === subjectId);
      setSubject(foundSubject);

      // Load courses for this subject
      const coursesResponse = await aiAPI.listCourses(user._id, subjectId);
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
            <button className="cta-btn" onClick={handleUploadCourse}>
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
                      {course.files?.length || 0} {course.files?.length === 1 ? 'file' : 'files'}
                    </span>
                  </div>
                </div>
                <div className="course-footer">
                  <button className="view-btn">View Details</button>
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
        preSelectedSubject={subject?.name}
      />
    </div>
  );
};

export default SubjectDetail;
