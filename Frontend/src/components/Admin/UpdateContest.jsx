// pages/admin/UpdateContestPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import axiosClient from '../../Utils/axiosClient';
import { 
  Edit, ArrowLeft, Calendar, Users, Clock, Award, 
  Loader, CheckCircle, XCircle, Search, Trophy, 
  Filter, Eye, Save, Tag, Lock, Globe, AlertCircle,
  Sparkles, Zap, Shield, ChevronDown, ChevronUp,
  FileText, Plus, Trash2
} from 'lucide-react';

const UpdateContestPage = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedContest, setSelectedContest] = useState(null);
  const [loadingContest, setLoadingContest] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hoveredContest, setHoveredContest] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    schedule: true,
    settings: true,
    problems: true,
    rules: true
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    rules: [],
    prizePool: '',
    tags: [],
    difficulty: 'medium',
    isPublic: true,
    problems: []
  });
  const [problems, setProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [searchProblem, setSearchProblem] = useState('');

  useEffect(() => {
    fetchContests();
    fetchAllProblems();
  }, [filter]);

  const fetchContests = async () => {
    setLoading(true);
    try {
      let url = `/api/contests?page=1&limit=50`;
      if (filter !== 'all') {
        url += `&status=${filter}`;
      }
      
      const { data } = await axiosClient.get(url);
      if (data.success) {
        setContests(data.contests || []);
      } else {
        setError('Failed to load contests');
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
      setError('Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProblems = async () => {
    try {
      const { data } = await axiosClient.get('/api/problems');
      if (data.success) {
        setProblems(data.problems || []);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
  };

  const fetchContestDetails = async (contestId) => {
    setLoadingContest(true);
    try {
      const { data } = await axiosClient.get(`/api/contests/${contestId}`);
      if (data.success) {
        const contest = data.contest;
        
        // Format dates for input
        const formatDateForInput = (dateString) => {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
        };

        setFormData({
          title: contest.title || '',
          description: contest.description || '',
          startTime: contest.startTime ? formatDateForInput(contest.startTime) : '',
          endTime: contest.endTime ? formatDateForInput(contest.endTime) : '',
          rules: contest.rules || [],
          prizePool: contest.prizePool || '',
          tags: contest.tags || [],
          difficulty: contest.difficulty || 'medium',
          isPublic: contest.isPublic !== undefined ? contest.isPublic : true,
          problems: contest.problems || []
        });

        // Set selected problems
        if (contest.problems && contest.problems.length > 0) {
          const problemsWithDetails = contest.problems.map(p => ({
            ...p,
            _id: p.problemId?._id || p.problemId,
            title: p.problemId?.title || `Problem ${p.order}`,
            difficulty: p.problemId?.difficulty || 'medium'
          }));
          setSelectedProblems(problemsWithDetails);
        }
        
        setSelectedContest(contest);
        setError('');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
      setError('Failed to load contest details');
    } finally {
      setLoadingContest(false);
    }
  };

  const handleSelectContest = (contest) => {
    setSelectedContest(contest);
    fetchContestDetails(contest._id);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleRuleAdd = () => {
    const newRule = prompt('Enter a new rule:');
    if (newRule && newRule.trim()) {
      setFormData({
        ...formData,
        rules: [...formData.rules, newRule.trim()]
      });
    }
  };

  const handleRuleRemove = (index) => {
    const newRules = [...formData.rules];
    newRules.splice(index, 1);
    setFormData({ ...formData, rules: newRules });
  };

  const handleAddProblem = (problem) => {
    if (!selectedProblems.find(p => p._id === problem._id)) {
      const problemWithPoints = {
        problemId: problem._id,
        points: 100,
        order: selectedProblems.length + 1,
        title: problem.title,
        difficulty: problem.difficulty,
        _id: problem._id
      };
      setSelectedProblems([...selectedProblems, problemWithPoints]);
    }
  };

  const handleRemoveProblem = (problemId) => {
    setSelectedProblems(selectedProblems.filter(p => p._id !== problemId));
  };

  const handleProblemPointsChange = (problemId, points) => {
    setSelectedProblems(selectedProblems.map(p => 
      p._id === problemId ? { ...p, points: parseInt(points) || 100 } : p
    ));
  };

  const handleProblemOrderChange = (problemId, order) => {
    setSelectedProblems(selectedProblems.map(p => 
      p._id === problemId ? { ...p, order: parseInt(order) || 1 } : p
    ));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    const now = new Date();
    
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    else if (startTime < now) newErrors.startTime = 'Start time must be in the future';
    
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    else if (endTime <= startTime) newErrors.endTime = 'End time must be after start time';
    
    if (selectedProblems.length === 0) {
      newErrors.problems = 'At least one problem is required';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    
    if (!validateForm() || !selectedContest) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare problems array
      const contestProblems = selectedProblems.map(p => ({
        problemId: p.problemId || p._id,
        points: p.points || 100,
        order: p.order || selectedProblems.indexOf(p) + 1
      }));
      
      const contestData = {
        ...formData,
        problems: contestProblems
      };
      
      const { data } = await axiosClient.put(`/api/contests/${selectedContest._id}`, contestData);
      
      if (data.success) {
        setSuccess('Contest updated successfully!');
        // Refresh contest list
        fetchContests();
        // Update selected contest with new data
        setSelectedContest(data.contest);
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(data.error || 'Failed to update contest');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred');
      console.error('Error updating contest:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ongoing': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'ended': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'ongoing': return <Zap size={12} className="text-green-400" />;
      case 'upcoming': return <Clock size={12} className="text-blue-400" />;
      case 'ended': return <Award size={12} className="text-yellow-400" />;
      default: return null;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const filteredContests = contests.filter(contest => 
    contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contest.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchProblem.toLowerCase()) ||
    problem.tags?.some(tag => tag.toLowerCase().includes(searchProblem.toLowerCase()))
  );

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(128, 0, 128, 0.15) 1px, transparent 0)',
          backgroundSize: '50px 50px'
        }}></div>
        
        <div className="relative text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-6 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Edit size={32} className="text-purple-400 animate-pulse" />
            </div>
          </div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-xl font-bold animate-pulse">
            Loading contests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden p-4 md:p-6">
      {/* Animated background grid */}
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(128, 0, 128, 0.15) 1px, transparent 0)',
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* Gradient orbs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-600/30 rounded-full filter blur-[128px] animate-pulse"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full filter blur-[128px] animate-pulse animation-delay-2000"></div>
      
      {/* Floating elements */}
      <div className="absolute top-40 right-20 text-purple-500/10 animate-float">
        <Trophy size={100} />
      </div>
      <div className="absolute bottom-40 left-20 text-purple-500/10 animate-float animation-delay-1000">
        <Edit size={80} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slideIn">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="group relative px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 hover:text-white hover:border-purple-400 transition-all duration-300 overflow-hidden mb-6"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            <span className="relative flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Admin Dashboard
            </span>
          </button>
          
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-70 animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 border border-blue-500">
                <Edit size={36} className="text-blue-400" />
              </div>
            </div>
            
            <h1 className="text-4xl font-black mb-2">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent bg-300% animate-gradient">
                Update Contests
              </span>
            </h1>
            <p className="text-purple-300/80 flex items-center justify-center gap-2">
              <Sparkles size={16} className="text-yellow-400" />
              Select a contest to update its details, problems, and settings
            </p>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg animate-scaleIn">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-green-500/20 rounded-full">
                <CheckCircle size={20} className="text-green-400" />
              </div>
              <span className="text-green-300">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-shake">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Contest List */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 mb-6 animate-slideIn animation-delay-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Trophy size={20} className="text-purple-400" />
                  All Contests ({filteredContests.length})
                </h2>
                <div className="flex gap-3">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search contests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-1 p-1 bg-black/30 border border-purple-500/30 rounded-lg">
                    {['all', 'ongoing', 'upcoming', 'ended'].map((status) => (
                      <button
                        key={status}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
                          filter === status 
                            ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white' 
                            : 'text-purple-300 hover:text-white hover:bg-purple-500/10'
                        }`}
                        onClick={() => setFilter(status)}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contest List */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
                {filteredContests.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy size={48} className="mx-auto text-purple-400 mb-4 opacity-50" />
                    <p className="text-purple-300 text-lg">No contests found</p>
                    <p className="text-sm text-purple-400/60 mt-2">Try adjusting your search or filter</p>
                  </div>
                ) : (
                  filteredContests.map((contest) => {
                    const isSelected = selectedContest?._id === contest._id;
                    return (
                      <div
                        key={contest._id}
                        className={`group relative p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'bg-blue-500/10 border-blue-500'
                            : 'bg-black/30 border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/5'
                        }`}
                        onClick={() => handleSelectContest(contest)}
                        onMouseEnter={() => setHoveredContest(contest._id)}
                        onMouseLeave={() => setHoveredContest(null)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-lg"></div>
                        
                        <div className="relative flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(contest.status)}`}>
                                {getStatusIcon(contest.status)}
                                {contest.status}
                              </span>
                              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded-full text-xs border border-purple-500/30">
                                {contest.difficulty}
                              </span>
                              {hoveredContest === contest._id && (
                                <span className="flex gap-1 ml-2">
                                  <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></span>
                                  <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse animation-delay-200"></span>
                                  <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse animation-delay-400"></span>
                                </span>
                              )}
                            </div>
                            
                            <h3 className="font-bold text-lg mb-1 group-hover:text-purple-300 transition-colors">
                              {contest.title}
                            </h3>
                            
                            <p className="text-gray-400 text-sm mb-3 line-clamp-1 group-hover:text-gray-300 transition-colors">
                              {contest.description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} className="text-blue-400" />
                                <span className="text-gray-300">{formatDate(contest.startTime)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users size={14} className="text-green-400" />
                                <span className="text-gray-300">{contest.participants?.length || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Award size={14} className="text-yellow-400" />
                                <span className="text-gray-300">{contest.problems?.length || 0}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Link
                              to={`/contests/${contest._id}`}
                              className="p-1.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 hover:bg-blue-500/20 hover:text-white transition-all"
                              onClick={(e) => e.stopPropagation()}
                              title="View Contest"
                            >
                              <Eye size={14} />
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectContest(contest);
                              }}
                              className="p-1.5 bg-green-500/10 border border-green-500/30 rounded text-green-400 hover:bg-green-500/20 hover:text-white transition-all"
                              title="Edit Contest"
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Update Form */}
          <div>
            <div className="bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6 sticky top-6 animate-slideIn animation-delay-400">
              {selectedContest ? (
                <>
                  {loadingContest ? (
                    <div className="text-center py-12">
                      <Loader className="animate-spin text-blue-400 mx-auto mb-4" size={40} />
                      <p className="text-blue-300">Loading contest details...</p>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Edit size={20} className="text-blue-400" />
                        Update Contest
                      </h2>
                      
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(selectedContest.status)}`}>
                            {getStatusIcon(selectedContest.status)}
                            {selectedContest.status}
                          </span>
                          <span className="text-sm text-gray-400 ml-auto">
                            ID: {selectedContest._id.substring(0, 8)}...
                          </span>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                          {/* Basic Information */}
                          <div className="border border-purple-500/30 rounded-lg overflow-hidden">
                            <div 
                              className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-900/30 to-purple-800/20 border-b border-purple-500/30 cursor-pointer"
                              onClick={() => toggleSection('basic')}
                            >
                              <div className="flex items-center gap-2">
                                <FileText size={16} className="text-purple-400" />
                                <h3 className="font-medium text-white">Basic Information</h3>
                              </div>
                              {expandedSections.basic ? <ChevronUp size={16} className="text-purple-400" /> : <ChevronDown size={16} className="text-purple-400" />}
                            </div>
                            
                            {expandedSections.basic && (
                              <div className="p-4 space-y-4">
                                <div>
                                  <label className="label">
                                    <span className="label-text text-purple-300">Title</span>
                                  </label>
                                  <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                                    <input
                                      type="text"
                                      name="title"
                                      value={formData.title}
                                      onChange={handleInputChange}
                                      className={`relative w-full px-4 py-2 bg-black/50 border-2 rounded-lg text-white placeholder-purple-300/30 outline-none transition-all ${
                                        formErrors.title 
                                          ? 'border-red-500/50 focus:border-red-500' 
                                          : 'border-purple-500/30 focus:border-purple-400'
                                      }`}
                                      placeholder="Contest Title"
                                    />
                                  </div>
                                  {formErrors.title && (
                                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                      <AlertCircle size={14} />
                                      {formErrors.title}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="label">
                                    <span className="label-text text-purple-300">Description</span>
                                  </label>
                                  <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                                    <textarea
                                      name="description"
                                      value={formData.description}
                                      onChange={handleInputChange}
                                      rows="3"
                                      className={`relative w-full px-4 py-2 bg-black/50 border-2 rounded-lg text-white placeholder-purple-300/30 outline-none transition-all ${
                                        formErrors.description 
                                          ? 'border-red-500/50 focus:border-red-500' 
                                          : 'border-purple-500/30 focus:border-purple-400'
                                      }`}
                                      placeholder="Contest description"
                                    />
                                  </div>
                                  {formErrors.description && (
                                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                      <AlertCircle size={14} />
                                      {formErrors.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Schedule */}
                          <div className="border border-purple-500/30 rounded-lg overflow-hidden">
                            <div 
                              className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-900/30 to-purple-800/20 border-b border-purple-500/30 cursor-pointer"
                              onClick={() => toggleSection('schedule')}
                            >
                              <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-purple-400" />
                                <h3 className="font-medium text-white">Schedule</h3>
                              </div>
                              {expandedSections.schedule ? <ChevronUp size={16} className="text-purple-400" /> : <ChevronDown size={16} className="text-purple-400" />}
                            </div>
                            
                            {expandedSections.schedule && (
                              <div className="p-4 grid grid-cols-2 gap-4">
                                <div>
                                  <label className="label">
                                    <span className="label-text text-purple-300">Start Time</span>
                                  </label>
                                  <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                                    <input
                                      type="datetime-local"
                                      name="startTime"
                                      value={formData.startTime}
                                      onChange={handleInputChange}
                                      className={`relative w-full px-4 py-2 bg-black/50 border-2 rounded-lg text-white outline-none transition-all ${
                                        formErrors.startTime 
                                          ? 'border-red-500/50 focus:border-red-500' 
                                          : 'border-purple-500/30 focus:border-purple-400'
                                      }`}
                                    />
                                  </div>
                                  {formErrors.startTime && (
                                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                      <AlertCircle size={14} />
                                      {formErrors.startTime}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="label">
                                    <span className="label-text text-purple-300">End Time</span>
                                  </label>
                                  <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                                    <input
                                      type="datetime-local"
                                      name="endTime"
                                      value={formData.endTime}
                                      onChange={handleInputChange}
                                      className={`relative w-full px-4 py-2 bg-black/50 border-2 rounded-lg text-white outline-none transition-all ${
                                        formErrors.endTime 
                                          ? 'border-red-500/50 focus:border-red-500' 
                                          : 'border-purple-500/30 focus:border-purple-400'
                                      }`}
                                    />
                                  </div>
                                  {formErrors.endTime && (
                                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                      <AlertCircle size={14} />
                                      {formErrors.endTime}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Settings */}
                          <div className="border border-purple-500/30 rounded-lg overflow-hidden">
                            <div 
                              className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-900/30 to-purple-800/20 border-b border-purple-500/30 cursor-pointer"
                              onClick={() => toggleSection('settings')}
                            >
                              <div className="flex items-center gap-2">
                                <Shield size={16} className="text-purple-400" />
                                <h3 className="font-medium text-white">Settings</h3>
                              </div>
                              {expandedSections.settings ? <ChevronUp size={16} className="text-purple-400" /> : <ChevronDown size={16} className="text-purple-400" />}
                            </div>
                            
                            {expandedSections.settings && (
                              <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="label">
                                      <span className="label-text text-purple-300">Difficulty</span>
                                    </label>
                                    <select
                                      name="difficulty"
                                      value={formData.difficulty}
                                      onChange={handleInputChange}
                                      className="w-full px-4 py-2 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white outline-none focus:border-purple-400 transition-all"
                                    >
                                      <option value="easy" className="bg-black">🟢 Easy</option>
                                      <option value="medium" className="bg-black">🟡 Medium</option>
                                      <option value="hard" className="bg-black">🔴 Hard</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="label">
                                      <span className="label-text text-purple-300">Prize Pool</span>
                                    </label>
                                    <div className="relative group">
                                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                                      <input
                                        type="text"
                                        name="prizePool"
                                        value={formData.prizePool}
                                        onChange={handleInputChange}
                                        className="relative w-full px-4 py-2 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all"
                                        placeholder="e.g., $1000"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                  <span className="text-purple-300 flex items-center gap-2">
                                    {formData.isPublic ? <Globe size={16} /> : <Lock size={16} />}
                                    {formData.isPublic ? 'Public Contest' : 'Private Contest'}
                                  </span>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      name="isPublic"
                                      checked={formData.isPublic}
                                      onChange={handleInputChange}
                                      className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                  </label>
                                </div>

                                <div>
                                  <label className="label">
                                    <span className="label-text text-purple-300 flex items-center gap-2">
                                      <Tag size={14} />
                                      Tags
                                    </span>
                                  </label>
                                  <div className="flex gap-2 mb-2">
                                    <div className="relative group flex-1">
                                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                                      <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                                        className="relative w-full px-4 py-2 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all"
                                        placeholder="Add a tag"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={handleTagAdd}
                                      className="group relative px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 hover:text-white hover:border-purple-400 transition-all duration-300 overflow-hidden"
                                    >
                                      <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                                      <span className="relative">Add</span>
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag, index) => (
                                      <span 
                                        key={index} 
                                        className="group/tag px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-sm flex items-center gap-1"
                                      >
                                        #{tag}
                                        <button
                                          type="button"
                                          onClick={() => handleTagRemove(tag)}
                                          className="hover:text-red-400 transition-colors"
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Problems Section */}
                          <div className="border border-purple-500/30 rounded-lg overflow-hidden">
                            <div 
                              className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-900/30 to-purple-800/20 border-b border-purple-500/30 cursor-pointer"
                              onClick={() => toggleSection('problems')}
                            >
                              <div className="flex items-center gap-2">
                                <FileText size={16} className="text-purple-400" />
                                <h3 className="font-medium text-white">Problems ({selectedProblems.length})</h3>
                              </div>
                              {expandedSections.problems ? <ChevronUp size={16} className="text-purple-400" /> : <ChevronDown size={16} className="text-purple-400" />}
                            </div>
                            
                            {expandedSections.problems && (
                              <div className="p-4">
                                {formErrors.problems && (
                                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <p className="text-sm text-red-400 flex items-center gap-1">
                                      <AlertCircle size={14} />
                                      {formErrors.problems}
                                    </p>
                                  </div>
                                )}

                                {/* Search Problems */}
                                <div className="mb-4">
                                  <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                                    <div className="relative">
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={16} />
                                      <input
                                        type="text"
                                        placeholder="Search problems..."
                                        value={searchProblem}
                                        onChange={(e) => setSearchProblem(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Available Problems */}
                                <div className="mb-4 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
                                  {filteredProblems.slice(0, 5).map((problem) => {
                                    const isAdded = selectedProblems.find(p => p._id === problem._id);
                                    return (
                                      <div
                                        key={problem._id}
                                        className={`flex justify-between items-center p-2 rounded transition-all ${
                                          isAdded ? 'bg-green-500/10' : 'hover:bg-purple-500/10'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-sm text-white">{problem.title}</span>
                                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                                            {problem.difficulty}
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleAddProblem(problem)}
                                          disabled={isAdded}
                                          className={`p-1 rounded transition-all ${
                                            isAdded 
                                              ? 'bg-green-500/20 text-green-400 cursor-not-allowed' 
                                              : 'bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20'
                                          }`}
                                          title={isAdded ? 'Already added' : 'Add problem'}
                                        >
                                          <Plus size={14} />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Selected Problems */}
                                <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
                                  {selectedProblems.map((problem, index) => (
                                    <div 
                                      key={problem._id} 
                                      className="p-3 bg-black/30 border border-purple-500/30 rounded-lg hover:border-purple-400 transition-all"
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/30">
                                            #{problem.order || index + 1}
                                          </span>
                                          <span className="font-medium text-sm text-white">{problem.title}</span>
                                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                                            {problem.difficulty}
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveProblem(problem._id)}
                                          className="p-1 bg-red-500/10 border border-red-500/30 rounded text-red-400 hover:bg-red-500/20 transition-all"
                                          title="Remove problem"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-xs text-purple-300 mb-1">Points</label>
                                          <input
                                            type="number"
                                            value={problem.points}
                                            onChange={(e) => handleProblemPointsChange(problem._id, e.target.value)}
                                            className="w-full px-2 py-1 bg-black/50 border border-purple-500/30 rounded text-white text-sm outline-none focus:border-purple-400"
                                            min="1"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-purple-300 mb-1">Order</label>
                                          <input
                                            type="number"
                                            value={problem.order}
                                            onChange={(e) => handleProblemOrderChange(problem._id, e.target.value)}
                                            className="w-full px-2 py-1 bg-black/50 border border-purple-500/30 rounded text-white text-sm outline-none focus:border-purple-400"
                                            min="1"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Rules */}
                          <div className="border border-purple-500/30 rounded-lg overflow-hidden">
                            <div 
                              className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-900/30 to-purple-800/20 border-b border-purple-500/30 cursor-pointer"
                              onClick={() => toggleSection('rules')}
                            >
                              <div className="flex items-center gap-2">
                                <Shield size={16} className="text-purple-400" />
                                <h3 className="font-medium text-white">Rules</h3>
                              </div>
                              {expandedSections.rules ? <ChevronUp size={16} className="text-purple-400" /> : <ChevronDown size={16} className="text-purple-400" />}
                            </div>
                            
                            {expandedSections.rules && (
                              <div className="p-4">
                                <div className="flex justify-end mb-2">
                                  <button
                                    type="button"
                                    onClick={handleRuleAdd}
                                    className="group relative px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 hover:text-white hover:border-purple-400 transition-all duration-300 overflow-hidden text-sm"
                                  >
                                    <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                                    <span className="relative flex items-center gap-1">
                                      <Plus size={14} />
                                      Add Rule
                                    </span>
                                  </button>
                                </div>
                                
                                <ul className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
                                  {formData.rules.map((rule, index) => (
                                    <li key={index} className="flex justify-between items-center p-2 bg-black/30 border border-purple-500/30 rounded-lg group">
                                      <span className="text-sm text-gray-300">{rule}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRuleRemove(index)}
                                        className="p-1 bg-red-500/10 border border-red-500/30 rounded text-red-400 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Submit Buttons */}
                          <div className="space-y-3 pt-4">
                            <button
                              type="submit"
                              disabled={loading}
                              className={`group relative w-full py-3 rounded-lg font-medium overflow-hidden transition-all duration-300 ${
                                loading 
                                  ? 'bg-gray-700 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                              }`}
                            >
                              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                              <span className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                  <>
                                    <Loader className="animate-spin" size={18} />
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <Save size={18} />
                                    Update Contest
                                  </>
                                )}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedContest(null)}
                              className="group relative w-full py-2.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 hover:text-white hover:border-purple-400 transition-all duration-300 overflow-hidden"
                            >
                              <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                              <span className="relative">Select Different Contest</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="relative inline-block mb-4">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-50"></div>
                    <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500">
                      <Edit size={28} className="text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">No Contest Selected</h3>
                  <p className="text-purple-300/60 text-sm">
                    Select a contest from the list to update its details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-gradient {
          background-size: 300% 300%;
          animation: gradient 6s ease infinite;
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-slideIn {
          animation: slideIn 0.6s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        
        .bg-300\% {
          background-size: 300%;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(128, 0, 128, 0.3);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 0, 128, 0.5);
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default UpdateContestPage;

// // pages/admin/UpdateContestPage.jsx
// import { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router';
// import axiosClient from '../../Utils/axiosClient';
// import { 
//   Edit, ArrowLeft, Calendar, Users, Clock, Award, 
//   Loader, CheckCircle, XCircle, Search, Trophy, 
//   Filter, Eye, Save, Tag, Lock, Globe, AlertCircle
// } from 'lucide-react';

// const UpdateContestPage = () => {
//   const navigate = useNavigate();
//   const [contests, setContests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filter, setFilter] = useState('all');
//   const [selectedContest, setSelectedContest] = useState(null);
//   const [loadingContest, setLoadingContest] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     startTime: '',
//     endTime: '',
//     rules: [],
//     prizePool: '',
//     tags: [],
//     difficulty: 'medium',
//     isPublic: true,
//     problems: []
//   });
//   const [problems, setProblems] = useState([]);
//   const [selectedProblems, setSelectedProblems] = useState([]);
//   const [formErrors, setFormErrors] = useState({});
//   const [tagInput, setTagInput] = useState('');
//   const [searchProblem, setSearchProblem] = useState('');

//   useEffect(() => {
//     fetchContests();
//     fetchAllProblems();
//   }, [filter]);

//   const fetchContests = async () => {
//     setLoading(true);
//     try {
//       let url = `/api/contests?page=1&limit=50`;
//       if (filter !== 'all') {
//         url += `&status=${filter}`;
//       }
      
//       const { data } = await axiosClient.get(url);
//       if (data.success) {
//         setContests(data.contests || []);
//       } else {
//         setError('Failed to load contests');
//       }
//     } catch (error) {
//       console.error('Error fetching contests:', error);
//       setError('Failed to load contests');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAllProblems = async () => {
//     try {
//       const { data } = await axiosClient.get('/api/problems');
//       if (data.success) {
//         setProblems(data.problems || []);
//       }
//     } catch (error) {
//       console.error('Error fetching problems:', error);
//     }
//   };

//   const fetchContestDetails = async (contestId) => {
//     setLoadingContest(true);
//     try {
//       const { data } = await axiosClient.get(`/api/contests/${contestId}`);
//       if (data.success) {
//         const contest = data.contest;
        
//         // Format dates for input
//         const formatDateForInput = (dateString) => {
//           const date = new Date(dateString);
//           return date.toISOString().slice(0, 16);
//         };

//         setFormData({
//           title: contest.title || '',
//           description: contest.description || '',
//           startTime: contest.startTime ? formatDateForInput(contest.startTime) : '',
//           endTime: contest.endTime ? formatDateForInput(contest.endTime) : '',
//           rules: contest.rules || [],
//           prizePool: contest.prizePool || '',
//           tags: contest.tags || [],
//           difficulty: contest.difficulty || 'medium',
//           isPublic: contest.isPublic !== undefined ? contest.isPublic : true,
//           problems: contest.problems || []
//         });

//         // Set selected problems
//         if (contest.problems && contest.problems.length > 0) {
//           const problemsWithDetails = contest.problems.map(p => ({
//             ...p,
//             _id: p.problemId?._id || p.problemId,
//             title: p.problemId?.title || `Problem ${p.order}`,
//             difficulty: p.problemId?.difficulty || 'medium'
//           }));
//           setSelectedProblems(problemsWithDetails);
//         }
        
//         setSelectedContest(contest);
//         setError('');
//         setSuccess('');
//       }
//     } catch (error) {
//       console.error('Error fetching contest:', error);
//       setError('Failed to load contest details');
//     } finally {
//       setLoadingContest(false);
//     }
//   };

//   const handleSelectContest = (contest) => {
//     setSelectedContest(contest);
//     fetchContestDetails(contest._id);
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value
//     });
//     if (formErrors[name]) {
//       setFormErrors({ ...formErrors, [name]: null });
//     }
//   };

//   const handleTagAdd = () => {
//     if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
//       setFormData({
//         ...formData,
//         tags: [...formData.tags, tagInput.trim()]
//       });
//       setTagInput('');
//     }
//   };

//   const handleTagRemove = (tagToRemove) => {
//     setFormData({
//       ...formData,
//       tags: formData.tags.filter(tag => tag !== tagToRemove)
//     });
//   };

//   const handleRuleAdd = () => {
//     const newRule = prompt('Enter a new rule:');
//     if (newRule && newRule.trim()) {
//       setFormData({
//         ...formData,
//         rules: [...formData.rules, newRule.trim()]
//       });
//     }
//   };

//   const handleRuleRemove = (index) => {
//     const newRules = [...formData.rules];
//     newRules.splice(index, 1);
//     setFormData({ ...formData, rules: newRules });
//   };

//   const handleAddProblem = (problem) => {
//     if (!selectedProblems.find(p => p._id === problem._id)) {
//       const problemWithPoints = {
//         problemId: problem._id,
//         points: 100,
//         order: selectedProblems.length + 1,
//         title: problem.title,
//         difficulty: problem.difficulty,
//         _id: problem._id
//       };
//       setSelectedProblems([...selectedProblems, problemWithPoints]);
//     }
//   };

//   const handleRemoveProblem = (problemId) => {
//     setSelectedProblems(selectedProblems.filter(p => p._id !== problemId));
//   };

//   const handleProblemPointsChange = (problemId, points) => {
//     setSelectedProblems(selectedProblems.map(p => 
//       p._id === problemId ? { ...p, points: parseInt(points) || 100 } : p
//     ));
//   };

//   const handleProblemOrderChange = (problemId, order) => {
//     setSelectedProblems(selectedProblems.map(p => 
//       p._id === problemId ? { ...p, order: parseInt(order) || 1 } : p
//     ));
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.title.trim()) newErrors.title = 'Title is required';
//     if (!formData.description.trim()) newErrors.description = 'Description is required';
    
//     const startTime = new Date(formData.startTime);
//     const endTime = new Date(formData.endTime);
//     const now = new Date();
    
//     if (!formData.startTime) newErrors.startTime = 'Start time is required';
//     else if (startTime < now) newErrors.startTime = 'Start time must be in the future';
    
//     if (!formData.endTime) newErrors.endTime = 'End time is required';
//     else if (endTime <= startTime) newErrors.endTime = 'End time must be after start time';
    
//     if (selectedProblems.length === 0) {
//       newErrors.problems = 'At least one problem is required';
//     }
    
//     setFormErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSuccess('');
//     setError('');
    
//     if (!validateForm() || !selectedContest) {
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       // Prepare problems array
//       const contestProblems = selectedProblems.map(p => ({
//         problemId: p.problemId || p._id,
//         points: p.points || 100,
//         order: p.order || selectedProblems.indexOf(p) + 1
//       }));
      
//       const contestData = {
//         ...formData,
//         problems: contestProblems
//       };
      
//       const { data } = await axiosClient.put(`/api/contests/${selectedContest._id}`, contestData);
      
//       if (data.success) {
//         setSuccess('Contest updated successfully!');
//         // Refresh contest list
//         fetchContests();
//         // Update selected contest with new data
//         setSelectedContest(data.contest);
//         setTimeout(() => {
//           setSuccess('');
//         }, 3000);
//       } else {
//         setError(data.error || 'Failed to update contest');
//       }
//     } catch (error) {
//       setError(error.response?.data?.error || 'An error occurred');
//       console.error('Error updating contest:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'ongoing': return 'badge-success';
//       case 'upcoming': return 'badge-info';
//       case 'ended': return 'badge-warning';
//       default: return 'badge-neutral';
//     }
//   };

//   const filteredContests = contests.filter(contest => 
//     contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     contest.description.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const filteredProblems = problems.filter(problem =>
//     problem.title.toLowerCase().includes(searchProblem.toLowerCase()) ||
//     problem.tags?.some(tag => tag.toLowerCase().includes(searchProblem.toLowerCase()))
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
//         <Loader className="animate-spin text-purple-400" size={40} />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <button
//             onClick={() => navigate('/admin/dashboard')}
//             className="btn btn-ghost btn-sm text-purple-300 hover:text-white mb-6"
//           >
//             <ArrowLeft size={20} className="mr-2" />
//             Back to Admin Dashboard
//           </button>
          
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 border border-blue-500 mb-4">
//               <Edit size={36} className="text-blue-400" />
//             </div>
//             <h1 className="text-3xl font-bold mb-2">Update Contests</h1>
//             <p className="text-purple-300">
//               Select a contest to update its details, problems, and settings
//             </p>
//           </div>
//         </div>

//         {/* Messages */}
//         {success && (
//           <div className="alert alert-success mb-6 bg-green-500/20 border-green-500 text-green-300">
//             <CheckCircle size={20} />
//             <span>{success}</span>
//           </div>
//         )}

//         {error && (
//           <div className="alert alert-error mb-6 bg-red-500/20 border-red-500 text-red-300">
//             <AlertCircle size={20} />
//             <span>{error}</span>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column: Contest List */}
//           <div className="lg:col-span-2">
//             <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6 mb-6">
//               <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
//                 <h2 className="text-xl font-bold">All Contests ({filteredContests.length})</h2>
//                 <div className="flex gap-3">
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={20} />
//                     <input
//                       type="text"
//                       placeholder="Search contests..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="input input-bordered pl-10 bg-black/50 border-purple-500 text-white"
//                     />
//                   </div>
//                   <div className="tabs tabs-boxed bg-black/30">
//                     {['all', 'ongoing', 'upcoming', 'ended'].map((status) => (
//                       <button
//                         key={status}
//                         className={`tab ${filter === status ? 'tab-active' : ''}`}
//                         onClick={() => setFilter(status)}
//                       >
//                         {status}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Contest List */}
//               <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
//                 {filteredContests.length === 0 ? (
//                   <div className="text-center py-8">
//                     <Trophy size={48} className="mx-auto text-gray-600 mb-4" />
//                     <p className="text-gray-400">No contests found</p>
//                   </div>
//                 ) : (
//                   filteredContests.map((contest) => (
//                     <div
//                       key={contest._id}
//                       className={`p-4 rounded-lg border cursor-pointer transition-all ${
//                         selectedContest?._id === contest._id
//                           ? 'bg-blue-500/10 border-blue-500'
//                           : 'bg-black/30 border-purple-500/30 hover:border-purple-500'
//                       }`}
//                       onClick={() => handleSelectContest(contest)}
//                     >
//                       <div className="flex justify-between items-start">
//                         <div className="flex-1">
//                           <div className="flex items-center gap-2 mb-2">
//                             <span className={`badge ${getStatusColor(contest.status)}`}>
//                               {contest.status}
//                             </span>
//                             <span className="badge bg-purple-500/20 text-purple-300 border-purple-500">
//                               {contest.difficulty}
//                             </span>
//                           </div>
//                           <h3 className="font-bold text-lg mb-1">{contest.title}</h3>
//                           <p className="text-gray-400 text-sm mb-3 line-clamp-1">
//                             {contest.description}
//                           </p>
//                           <div className="flex items-center gap-4 text-sm">
//                             <div className="flex items-center gap-1">
//                               <Calendar size={14} className="text-blue-400" />
//                               <span>{formatDate(contest.startTime)}</span>
//                             </div>
//                             <div className="flex items-center gap-1">
//                               <Users size={14} className="text-green-400" />
//                               <span>{contest.participants?.length || 0} participants</span>
//                             </div>
//                             <div className="flex items-center gap-1">
//                               <Award size={14} className="text-yellow-400" />
//                               <span>{contest.problems?.length || 0} problems</span>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="flex gap-2 ml-4">
//                           <Link
//                             to={`/contests/${contest._id}`}
//                             className="btn btn-xs btn-outline border-blue-500 text-blue-400 hover:bg-blue-600"
//                             onClick={(e) => e.stopPropagation()}
//                             title="View Contest"
//                           >
//                             <Eye size={14} />
//                           </Link>
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleSelectContest(contest);
//                             }}
//                             className="btn btn-xs btn-outline border-green-500 text-green-400 hover:bg-green-600"
//                             title="Edit Contest"
//                           >
//                             <Edit size={14} />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Right Column: Update Form */}
//           <div>
//             <div className="bg-black/40 border border-blue-500/30 rounded-xl p-6 sticky top-6">
//               {selectedContest ? (
//                 <>
//                   {loadingContest ? (
//                     <div className="text-center py-8">
//                       <Loader className="animate-spin text-blue-400 mx-auto mb-4" size={30} />
//                       <p>Loading contest details...</p>
//                     </div>
//                   ) : (
//                     <>
//                       <h2 className="text-xl font-bold mb-4">Update Contest</h2>
                      
//                       <div className="mb-6">
//                         <div className="flex items-center gap-2 mb-4">
//                           <span className={`badge ${getStatusColor(selectedContest.status)}`}>
//                             {selectedContest.status}
//                           </span>
//                           <span className="text-sm text-gray-400">
//                             ID: {selectedContest._id.substring(0, 8)}...
//                           </span>
//                         </div>
                        
//                         <form onSubmit={handleSubmit} className="space-y-6">
//                           {/* Basic Info */}
//                           <div className="space-y-4">
//                             <div>
//                               <label className="label">
//                                 <span className="label-text text-white">Title</span>
//                               </label>
//                               <input
//                                 type="text"
//                                 name="title"
//                                 value={formData.title}
//                                 onChange={handleInputChange}
//                                 className={`input input-bordered w-full bg-black/50 border-purple-500 text-white ${
//                                   formErrors.title ? 'border-red-500' : ''
//                                 }`}
//                                 placeholder="Contest Title"
//                               />
//                               {formErrors.title && (
//                                 <p className="text-red-400 text-sm mt-1">{formErrors.title}</p>
//                               )}
//                             </div>

//                             <div>
//                               <label className="label">
//                                 <span className="label-text text-white">Description</span>
//                               </label>
//                               <textarea
//                                 name="description"
//                                 value={formData.description}
//                                 onChange={handleInputChange}
//                                 className={`textarea textarea-bordered w-full bg-black/50 border-purple-500 text-white ${
//                                   formErrors.description ? 'border-red-500' : ''
//                                 }`}
//                                 rows="3"
//                                 placeholder="Contest description"
//                               />
//                               {formErrors.description && (
//                                 <p className="text-red-400 text-sm mt-1">{formErrors.description}</p>
//                               )}
//                             </div>
//                           </div>

//                           {/* Date & Time */}
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                               <label className="label">
//                                 <span className="label-text text-white flex items-center gap-2">
//                                   <Calendar size={14} />
//                                   Start Time
//                                 </span>
//                               </label>
//                               <input
//                                 type="datetime-local"
//                                 name="startTime"
//                                 value={formData.startTime}
//                                 onChange={handleInputChange}
//                                 className={`input input-bordered w-full bg-black/50 border-purple-500 text-white ${
//                                   formErrors.startTime ? 'border-red-500' : ''
//                                 }`}
//                               />
//                               {formErrors.startTime && (
//                                 <p className="text-red-400 text-sm mt-1">{formErrors.startTime}</p>
//                               )}
//                             </div>

//                             <div>
//                               <label className="label">
//                                 <span className="label-text text-white flex items-center gap-2">
//                                   <Calendar size={14} />
//                                   End Time
//                                 </span>
//                               </label>
//                               <input
//                                 type="datetime-local"
//                                 name="endTime"
//                                 value={formData.endTime}
//                                 onChange={handleInputChange}
//                                 className={`input input-bordered w-full bg-black/50 border-purple-500 text-white ${
//                                   formErrors.endTime ? 'border-red-500' : ''
//                                 }`}
//                               />
//                               {formErrors.endTime && (
//                                 <p className="text-red-400 text-sm mt-1">{formErrors.endTime}</p>
//                               )}
//                             </div>
//                           </div>

//                           {/* Difficulty & Privacy */}
//                           <div className="grid grid-cols-2 gap-4">
//                             <div>
//                               <label className="label">
//                                 <span className="label-text text-white">Difficulty</span>
//                               </label>
//                               <select
//                                 name="difficulty"
//                                 value={formData.difficulty}
//                                 onChange={handleInputChange}
//                                 className="select select-bordered w-full bg-black/50 border-purple-500 text-white"
//                               >
//                                 <option value="easy">Easy</option>
//                                 <option value="medium">Medium</option>
//                                 <option value="hard">Hard</option>
//                               </select>
//                             </div>

//                             <div className="flex items-center justify-center pt-8">
//                               <label className="label cursor-pointer">
//                                 <span className="label-text text-white mr-2">
//                                   {formData.isPublic ? (
//                                     <span className="flex items-center gap-1">
//                                       <Globe size={14} /> Public
//                                     </span>
//                                   ) : (
//                                     <span className="flex items-center gap-1">
//                                       <Lock size={14} /> Private
//                                     </span>
//                                   )}
//                                 </span>
//                                 <input
//                                   type="checkbox"
//                                   name="isPublic"
//                                   checked={formData.isPublic}
//                                   onChange={handleInputChange}
//                                   className="toggle toggle-primary"
//                                 />
//                               </label>
//                             </div>
//                           </div>

//                           {/* Prize Pool */}
//                           <div>
//                             <label className="label">
//                               <span className="label-text text-white flex items-center gap-2">
//                                 <Award size={14} />
//                                 Prize Pool (Optional)
//                               </span>
//                             </label>
//                             <input
//                               type="text"
//                               name="prizePool"
//                               value={formData.prizePool}
//                               onChange={handleInputChange}
//                               className="input input-bordered w-full bg-black/50 border-purple-500 text-white"
//                               placeholder="e.g., $1000"
//                             />
//                           </div>

//                           {/* Tags */}
//                           <div>
//                             <label className="label">
//                               <span className="label-text text-white flex items-center gap-2">
//                                 <Tag size={14} />
//                                 Tags
//                               </span>
//                             </label>
//                             <div className="flex gap-2 mb-2">
//                               <input
//                                 type="text"
//                                 value={tagInput}
//                                 onChange={(e) => setTagInput(e.target.value)}
//                                 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
//                                 className="input input-bordered flex-1 bg-black/50 border-purple-500 text-white"
//                                 placeholder="Add a tag"
//                               />
//                               <button
//                                 type="button"
//                                 onClick={handleTagAdd}
//                                 className="btn btn-outline border-purple-500 text-purple-300"
//                               >
//                                 Add
//                               </button>
//                             </div>
//                             <div className="flex flex-wrap gap-2">
//                               {formData.tags.map((tag, index) => (
//                                 <span key={index} className="badge bg-purple-500/20 text-purple-300 border-purple-500">
//                                   {tag}
//                                   <button
//                                     type="button"
//                                     onClick={() => handleTagRemove(tag)}
//                                     className="ml-2 hover:text-white"
//                                   >
//                                     ×
//                                   </button>
//                                 </span>
//                               ))}
//                             </div>
//                           </div>

//                           {/* Problems Section */}
//                           <div>
//                             <div className="flex justify-between items-center mb-4">
//                               <label className="label">
//                                 <span className="label-text text-white font-bold">Problems</span>
//                               </label>
//                               <span className="text-sm text-gray-400">
//                                 {selectedProblems.length} selected
//                               </span>
//                             </div>
                            
//                             {formErrors.problems && (
//                               <p className="text-red-400 text-sm mb-2">{formErrors.problems}</p>
//                             )}

//                             {/* Search Problems */}
//                             <div className="mb-4">
//                               <div className="relative mb-2">
//                                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={16} />
//                                 <input
//                                   type="text"
//                                   placeholder="Search problems..."
//                                   value={searchProblem}
//                                   onChange={(e) => setSearchProblem(e.target.value)}
//                                   className="input input-sm input-bordered pl-10 w-full bg-black/50 border-purple-500 text-white"
//                                 />
//                               </div>
                              
//                               {/* Available Problems */}
//                               <div className="max-h-40 overflow-y-auto mb-4">
//                                 {filteredProblems.slice(0, 5).map((problem) => (
//                                   <div
//                                     key={problem._id}
//                                     className="flex justify-between items-center p-2 hover:bg-purple-500/10 rounded"
//                                   >
//                                     <div>
//                                       <span className="font-medium">{problem.title}</span>
//                                       <span className={`badge badge-xs ml-2 ${
//                                         problem.difficulty === 'easy' ? 'badge-success' :
//                                         problem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
//                                       }`}>
//                                         {problem.difficulty}
//                                       </span>
//                                     </div>
//                                     <button
//                                       type="button"
//                                       onClick={() => handleAddProblem(problem)}
//                                       disabled={selectedProblems.find(p => p._id === problem._id)}
//                                       className="btn btn-xs btn-outline border-green-500 text-green-400"
//                                     >
//                                       Add
//                                     </button>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>

//                             {/* Selected Problems */}
//                             <div className="space-y-3">
//                               {selectedProblems.map((problem, index) => (
//                                 <div key={problem._id} className="p-3 bg-black/30 rounded border border-purple-500/30">
//                                   <div className="flex justify-between items-start mb-2">
//                                     <div>
//                                       <span className="font-bold">{problem.order}. {problem.title}</span>
//                                       <span className={`badge badge-xs ml-2 ${
//                                         problem.difficulty === 'easy' ? 'badge-success' :
//                                         problem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
//                                       }`}>
//                                         {problem.difficulty}
//                                       </span>
//                                     </div>
//                                     <button
//                                       type="button"
//                                       onClick={() => handleRemoveProblem(problem._id)}
//                                       className="btn btn-xs btn-outline border-red-500 text-red-400"
//                                     >
//                                       Remove
//                                     </button>
//                                   </div>
//                                   <div className="grid grid-cols-2 gap-2">
//                                     <div>
//                                       <label className="label label-text text-xs">Points</label>
//                                       <input
//                                         type="number"
//                                         value={problem.points}
//                                         onChange={(e) => handleProblemPointsChange(problem._id, e.target.value)}
//                                         className="input input-xs w-full bg-black/50 border-purple-500"
//                                         min="1"
//                                       />
//                                     </div>
//                                     <div>
//                                       <label className="label label-text text-xs">Order</label>
//                                       <input
//                                         type="number"
//                                         value={problem.order}
//                                         onChange={(e) => handleProblemOrderChange(problem._id, e.target.value)}
//                                         className="input input-xs w-full bg-black/50 border-purple-500"
//                                         min="1"
//                                       />
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>

//                           {/* Rules */}
//                           <div>
//                             <div className="flex justify-between items-center mb-2">
//                               <label className="label">
//                                 <span className="label-text text-white">Rules</span>
//                               </label>
//                               <button
//                                 type="button"
//                                 onClick={handleRuleAdd}
//                                 className="btn btn-xs btn-outline border-purple-500 text-purple-300"
//                               >
//                                 Add Rule
//                               </button>
//                             </div>
//                             <ul className="space-y-2">
//                               {formData.rules.map((rule, index) => (
//                                 <li key={index} className="flex justify-between items-center p-2 bg-black/30 rounded">
//                                   <span>{rule}</span>
//                                   <button
//                                     type="button"
//                                     onClick={() => handleRuleRemove(index)}
//                                     className="btn btn-xs btn-ghost text-red-400"
//                                   >
//                                     Remove
//                                   </button>
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>

//                           {/* Submit Buttons */}
//                           <div className="space-y-3 pt-4">
//                             <button
//                               type="submit"
//                               disabled={loading}
//                               className={`btn w-full ${
//                                 loading ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white hover:from-blue-700 hover:to-purple-700'
//                               }`}
//                             >
//                               {loading ? (
//                                 <>
//                                   <Loader className="animate-spin mr-2" size={20} />
//                                   Updating...
//                                 </>
//                               ) : (
//                                 <>
//                                   <Save size={20} className="mr-2" />
//                                   Update Contest
//                                 </>
//                               )}
//                             </button>

//                             <button
//                               type="button"
//                               onClick={() => setSelectedContest(null)}
//                               className="btn btn-outline w-full border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white"
//                             >
//                               Select Different Contest
//                             </button>
//                           </div>
//                         </form>
//                       </div>
//                     </>
//                   )}
//                 </>
//               ) : (
//                 <div className="text-center py-8">
//                   <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700/30 border border-gray-600 mb-4">
//                     <Edit size={28} className="text-gray-400" />
//                   </div>
//                   <h3 className="text-lg font-bold mb-2">No Contest Selected</h3>
//                   <p className="text-gray-400 text-sm">
//                     Select a contest from the list to update its details
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Alternative Actions */}
//             {/* <div className="mt-6 text-center">
//               <p className="text-gray-400 text-sm mb-4">
//                 Need to perform other actions?
//               </p>
//               <div className="flex flex-col gap-2">
//                 <Link
//                   to="/admin/contests/create"
//                   className="btn btn-outline btn-sm border-green-500 text-green-300 hover:bg-green-600"
//                 >
//                   Create New Contest
//                 </Link>
//                 <Link
//                   to="/admin/contests/delete"
//                   className="btn btn-outline btn-sm border-red-500 text-red-300 hover:bg-red-600"
//                 >
//                   Delete Contests
//                 </Link>
//                 <Link
//                   to="/contests"
//                   className="btn btn-outline btn-sm border-purple-500 text-purple-300 hover:bg-purple-600"
//                 >
//                   View All Contests
//                 </Link>
//               </div> 
//             </div> */}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UpdateContestPage;