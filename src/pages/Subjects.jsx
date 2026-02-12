import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Plus, ChevronRight, Search } from 'lucide-react';
import UploadModal from '../components/UploadModal';
import './Subjects.css';

const Subjects = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadSubjects();
    }
  }, [user]);

  const loadSubjects = async () => {
    if (!user?._id) return;
    try {
      const response = await aiAPI.listSubjects(user._id);
      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (subjectId) => {
    navigate(`/subjects/${subjectId}`);
  };

  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="subjects-container">
      <div className="subjects-header">
        <div className="header-left">
          <div className="title-section">
            <h1>Library</h1>
            <span className="count-badge">{subjects.length}</span>
          </div>
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search subjects..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <button className="add-fab" onClick={() => setIsModalOpen(true)} title="Add Course">
          <Plus size={24} />
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your library...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={64} />
          <h2>Your Library is Empty</h2>
          <p>Add your first course to get started with personalized study plans.</p>
          <button className="cta-btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            Add First Course
          </button>
        </div>
      ) : (
        <div className="subjects-grid">
          {filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              className="subject-card"
              onClick={() => handleSubjectClick(subject.id)}
            >
              <div className="card-image-wrapper">
                {subject.image ? (
                  <img src={subject.image} alt={subject.name} className="subject-cover-image" />
                ) : (
                  <div className="subject-placeholder-gradient">
                    <BookOpen size={48} />
                  </div>
                )}
                <div className="card-overlay"></div>
              </div>
              
              <div className="card-content">
                <span className="subject-type">SUBJECT</span>
                <h3 className="subject-title">{subject.name}</h3>
                <div className="subject-details">
                  <span className="course-count">
                    {subject.course_count} {subject.course_count === 1 ? 'Course' : 'Courses'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add New Card in Grid */}
          <div className="subject-card add-card" onClick={() => setIsModalOpen(true)}>
             <div className="card-image-wrapper plain">
                <Plus size={48} className="add-icon" />
             </div>
             <div className="card-content">
                <span className="subject-type">ACTION</span>
                <h3 className="subject-title">Add Course</h3>
             </div>
          </div>
        </div>
      )}

      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUploadComplete={loadSubjects}
      />
    </div>
  );
};

export default Subjects;
