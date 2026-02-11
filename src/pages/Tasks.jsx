import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tasksAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

const Tasks = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, todo, in-progress, completed
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    estimatedTime: '',
    dueDate: '',
    tags: ''
  });

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await tasksAPI.getAll(params);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const taskData = {
        ...formData,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      };

      if (editingTask) {
        await tasksAPI.update(editingTask._id, taskData);
      } else {
        await tasksAPI.create(taskData);
      }

      fetchTasks();
      resetForm();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.delete(taskId);
        fetchTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      estimatedTime: '',
      dueDate: '',
      tags: ''
    });
    setEditingTask(null);
    setShowCreateModal(false);
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      estimatedTime: task.estimatedTime || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      tags: task.tags?.join(', ') || ''
    });
    setShowCreateModal(true);
  };

  const filteredTasks = tasks;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1923]">
        <div className="text-white text-xl font-bold tracking-wider">LOADING TASKS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1923] text-white pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f1923] via-[#1a2633] to-[#0f1923] border-b-4 border-[#ff4655]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold tracking-wider uppercase">
                <span className="text-[#ff4655]">//</span> TASKS
              </h1>
              <p className="text-gray-400 mt-2">Manage your study tasks</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-[#ff4655] hover:bg-[#ff2a3a] transition-all duration-300 font-bold tracking-wider"
            >
              + NEW TASK
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {['all', 'todo', 'in-progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 font-bold tracking-wider transition-all border-2 ${
                filter === status
                  ? 'bg-[#ff4655] border-[#ff4655] text-white'
                  : 'bg-[#1a2633] border-[#2e3a4a] text-gray-400 hover:border-[#ff4655]'
              }`}
            >
              {status.toUpperCase().replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">  
          <AnimatePresence>
            {filteredTasks.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-400 text-xl mb-4">NO TASKS FOUND</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-[#ff4655] hover:bg-[#ff2a3a] font-bold tracking-wider"
                >
                  CREATE YOUR FIRST TASK
                </button>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a2633] border-2 border-[#ff4655] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-3xl font-bold mb-6">
                <span className="text-[#ff4655]">//</span> {editingTask ? 'EDIT' : 'NEW'} TASK
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-300">TITLE</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f1923] border-2 border-[#2e3a4a] focus:border-[#ff4655] text-white outline-none"
                    placeholder="Task title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-300">DESCRIPTION</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f1923] border-2 border-[#2e3a4a] focus:border-[#ff4655] text-white outline-none h-24"
                    placeholder="Task description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">PRIORITY</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0f1923] border-2 border-[#2e3a4a] focus:border-[#ff4655] text-white outline-none"
                    >
                      <option value="low">LOW</option>
                      <option value="medium">MEDIUM</option>
                      <option value="high">HIGH</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">ESTIMATED TIME (min)</label>
                    <input
                      type="number"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0f1923] border-2 border-[#2e3a4a] focus:border-[#ff4655] text-white outline-none"
                      placeholder="60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-300">DUE DATE</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f1923] border-2 border-[#2e3a4a] focus:border-[#ff4655] text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-300">TAGS (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f1923] border-2 border-[#2e3a4a] focus:border-[#ff4655] text-white outline-none"
                    placeholder="math, homework, urgent"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-[#ff4655] hover:bg-[#ff2a3a] font-bold tracking-wider transition-all"
                  >
                    {editingTask ? 'UPDATE' : 'CREATE'} TASK
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-[#2e3a4a] hover:bg-[#3e4a5a] font-bold tracking-wider transition-all"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-[#1a2633] border-2 border-[#2e3a4a] p-6 relative overflow-hidden group hover:border-[#ff4655] transition-all"
    >
      {/* Priority indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 ${
        task.priority === 'high' ? 'bg-red-500' :
        task.priority === 'medium' ? 'bg-yellow-500' :
        'bg-green-500'
      }`}></div>

      {/* Status Badge */}
      <div className={`absolute top-4 right-4 px-2 py-1 text-xs font-bold ${
        task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
        task.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-gray-500/20 text-gray-400'
      }`}>
        {task.status?.toUpperCase().replace('-', ' ')}
      </div>

      {/* Content */}
      <div className="mt-2">
        <h3 className="text-xl font-bold mb-2 text-white">{task.title}</h3>
        {task.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-3">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {task.tags?.map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-[#0f1923] text-xs text-gray-400">
              #{tag}
            </span>
          ))}
        </div>

        {task.estimatedTime && (
          <div className="text-sm text-gray-400 mb-4">
            ⏱ {task.estimatedTime} minutes
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          {task.status !== 'completed' && (
            <button
              onClick={() => onStatusChange(task._id, task.status === 'todo' ? 'in-progress' : 'completed')}
              className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-bold transition-all"
            >
              {task.status === 'todo' ? 'START' : 'COMPLETE'}
            </button>
          )}
          <button
            onClick={() => onEdit(task)}
            className="px-3 py-2 bg-[#2e3a4a] hover:bg-[#3e4a5a] text-sm font-bold transition-all"
          >
            EDIT
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-bold transition-all"
          >
            DELETE
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Tasks;
