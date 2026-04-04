
// pages/admin/DeleteContestPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import axiosClient from '../../Utils/axiosClient';
import { 
  Trash2, AlertTriangle, ArrowLeft, Calendar, 
  Users, Clock, Award, Loader, CheckCircle, XCircle,
  Search, Trophy, Filter, Eye, Edit, Sparkles,
  Zap, Shield, ChevronDown, ChevronUp, AlertOctagon,
  Ban, Info, Globe, Lock, FileText
} from 'lucide-react';

const DeleteContestPage = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedContest, setSelectedContest] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [hoveredContest, setHoveredContest] = useState(null);

  useEffect(() => {
    fetchContests();
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

  const handleDelete = async (contestId, contestTitle) => {
    if (window.confirm(`Are you sure you want to delete "${contestTitle}"? This action cannot be undone.`)) {
      setDeleting(true);
      setError('');
      
      try {
        const { data } = await axiosClient.delete(`/api/contests/${contestId}`);
        
        if (data.success) {
          setSuccess(`Contest "${contestTitle}" deleted successfully!`);
          // Remove from local state
          setContests(contests.filter(contest => contest._id !== contestId));
          // Reset selected contest if it was deleted
          if (selectedContest && selectedContest._id === contestId) {
            setSelectedContest(null);
            setConfirmText('');
          }
        } else {
          setError(data.error || 'Failed to delete contest');
        }
      } catch (error) {
        setError(error.response?.data?.error || 'An error occurred');
        console.error('Error deleting contest:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleDeleteWithConfirmation = async () => {
    if (!selectedContest) return;
    
    if (confirmText !== 'DELETE') {
      setError('Please type "DELETE" to confirm');
      return;
    }

    await handleDelete(selectedContest._id, selectedContest.title);
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

  const filteredContests = contests.filter(contest => 
    contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contest.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Trash2 size={32} className="text-purple-400 animate-pulse" />
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
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-red-600/30 rounded-full filter blur-[128px] animate-pulse animation-delay-2000"></div>
      
      {/* Floating elements */}
      <div className="absolute top-40 right-20 text-purple-500/10 animate-float">
        <AlertTriangle size={100} />
      </div>
      <div className="absolute bottom-40 left-20 text-purple-500/10 animate-float animation-delay-1000">
        <Trash2 size={80} />
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
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-full blur opacity-70 animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border border-red-500">
                <AlertTriangle size={36} className="text-red-400" />
              </div>
            </div>
            
            <h1 className="text-4xl font-black mb-2">
              <span className="bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent bg-300% animate-gradient">
                Delete Contests
              </span>
            </h1>
            <p className="text-purple-300/80 flex items-center justify-center gap-2">
              <Sparkles size={16} className="text-yellow-400" />
              Select contests to delete. This action is permanent and cannot be undone.
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
              <AlertTriangle size={20} className="text-red-400" />
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
                            ? 'bg-red-500/10 border-red-500'
                            : 'bg-black/30 border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/5'
                        }`}
                        onClick={() => setSelectedContest(contest)}
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
                                <span className="text-gray-300">{contest.participants?.length || 0} participants</span>
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
                                handleDelete(contest._id, contest.title);
                              }}
                              className="p-1.5 bg-red-500/10 border border-red-500/30 rounded text-red-400 hover:bg-red-500/20 hover:text-white transition-all"
                              title="Delete Contest"
                              disabled={deleting}
                            >
                              <Trash2 size={14} />
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

          {/* Right Column: Selected Contest Details */}
          <div>
            <div className="bg-black/40 backdrop-blur-xl border border-red-500/30 rounded-xl p-6 sticky top-6 animate-slideIn animation-delay-400">
              {selectedContest ? (
                <>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertOctagon size={20} className="text-red-400" />
                    Confirm Deletion
                  </h2>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-2 text-white">{selectedContest.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{selectedContest.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-black/30 border border-purple-500/20 rounded-lg p-3">
                        <div className="text-sm text-gray-400 mb-1">Status</div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${getStatusColor(selectedContest.status)}`}>
                          {getStatusIcon(selectedContest.status)}
                          {selectedContest.status}
                        </div>
                      </div>
                      <div className="bg-black/30 border border-purple-500/20 rounded-lg p-3">
                        <div className="text-sm text-gray-400 mb-1">Participants</div>
                        <div className="text-lg font-bold text-white">{selectedContest.participants?.length || 0}</div>
                      </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-red-300 mb-1">Warning</h4>
                          <p className="text-red-300/80 text-sm">
                            Deleting this contest will permanently remove all data including submissions, leaderboard, and participant registrations.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="label">
                        <span className="label-text text-purple-300">
                          Type <span className="font-bold text-red-400">DELETE</span> to confirm:
                        </span>
                      </label>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                        <input
                          type="text"
                          value={confirmText}
                          onChange={(e) => {
                            setConfirmText(e.target.value);
                            if (error) setError('');
                          }}
                          placeholder="Type DELETE here"
                          className="relative w-full px-4 py-2 bg-black/50 border-2 border-red-500/30 rounded-lg text-white placeholder-red-300/30 outline-none focus:border-red-400 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleDeleteWithConfirmation}
                        disabled={deleting || confirmText !== 'DELETE'}
                        className={`group relative w-full py-2.5 rounded-lg font-medium overflow-hidden transition-all duration-300 ${
                          confirmText === 'DELETE'
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                        <span className="relative flex items-center justify-center gap-2">
                          {deleting ? (
                            <>
                              <Loader className="animate-spin" size={18} />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 size={18} />
                              Delete Contest Permanently
                            </>
                          )}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedContest(null);
                          setConfirmText('');
                        }}
                        className="group relative w-full py-2.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 hover:text-white hover:border-purple-400 transition-all duration-300 overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                        <span className="relative">Select Different Contest</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="relative inline-block mb-4">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-50"></div>
                    <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500">
                      <AlertTriangle size={28} className="text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">No Contest Selected</h3>
                  <p className="text-purple-300/60 text-sm">
                    Select a contest from the list to view deletion details
                  </p>
                </div>
              )}
            </div>

            {/* Alternative Actions */}
            <div className="mt-6 text-center animate-slideIn animation-delay-600">
              <p className="text-purple-300/60 text-sm mb-4">
                Instead of deleting, you can also:
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  to="/admin/contests/create"
                  className="group relative px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 hover:text-white hover:border-blue-400 transition-all duration-300 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    <Zap size={16} />
                    Create New Contest
                  </span>
                </Link>
                <Link
                  to="/contests"
                  className="group relative px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 hover:text-white hover:border-purple-400 transition-all duration-300 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    <Trophy size={16} />
                    View All Contests
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 p-6 border border-red-500/30 rounded-xl bg-red-500/5 backdrop-blur-sm animate-slideIn animation-delay-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertOctagon size={24} className="text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-red-300">Danger Zone</h3>
          </div>
          
          <p className="text-red-300/80 mb-4">
            Deleting contests is a permanent action. Consider archiving or disabling contests instead if you might need the data later.
          </p>
          
          <div className="text-sm text-gray-400 bg-black/30 p-4 rounded-lg border border-red-500/20">
            <p className="font-medium text-red-300 mb-2">⚠️ Contest deletion will remove:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>All contest submissions and solutions</li>
              <li>Leaderboard rankings and scores</li>
              <li>Participant registrations</li>
              <li>Contest statistics and analytics</li>
            </ul>
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
        
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        
        .animation-delay-800 {
          animation-delay: 800ms;
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

export default DeleteContestPage;

// // pages/admin/DeleteContestPage.jsx
// import { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router';
// import axiosClient from '../../Utils/axiosClient';
// import { 
//   Trash2, AlertTriangle, ArrowLeft, Calendar, 
//   Users, Clock, Award, Loader, CheckCircle, XCircle,
//   Search, Trophy, Filter, Eye, Edit
// } from 'lucide-react';

// const DeleteContestPage = () => {
//   const navigate = useNavigate();
//   const [contests, setContests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filter, setFilter] = useState('all');
//   const [selectedContest, setSelectedContest] = useState(null);
//   const [confirmText, setConfirmText] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [deleting, setDeleting] = useState(false);

//   useEffect(() => {
//     fetchContests();
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

//   const handleDelete = async (contestId, contestTitle) => {
//     if (window.confirm(`Are you sure you want to delete "${contestTitle}"? This action cannot be undone.`)) {
//       setDeleting(true);
//       setError('');
      
//       try {
//         const { data } = await axiosClient.delete(`/api/contests/${contestId}`);
        
//         if (data.success) {
//           setSuccess(`Contest "${contestTitle}" deleted successfully!`);
//           // Remove from local state
//           setContests(contests.filter(contest => contest._id !== contestId));
//           // Reset selected contest if it was deleted
//           if (selectedContest && selectedContest._id === contestId) {
//             setSelectedContest(null);
//             setConfirmText('');
//           }
//         } else {
//           setError(data.error || 'Failed to delete contest');
//         }
//       } catch (error) {
//         setError(error.response?.data?.error || 'An error occurred');
//         console.error('Error deleting contest:', error);
//       } finally {
//         setDeleting(false);
//       }
//     }
//   };

//   const handleDeleteWithConfirmation = async () => {
//     if (!selectedContest) return;
    
//     if (confirmText !== 'DELETE') {
//       setError('Please type "DELETE" to confirm');
//       return;
//     }

//     await handleDelete(selectedContest._id, selectedContest.title);
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
//             <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border border-red-500 mb-4">
//               <AlertTriangle size={36} className="text-red-400" />
//             </div>
//             <h1 className="text-3xl font-bold mb-2">Delete Contests</h1>
//             <p className="text-purple-300">
//               Select contests to delete. This action is permanent and cannot be undone.
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
//             <AlertTriangle size={20} />
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
//                           ? 'bg-red-500/10 border-red-500'
//                           : 'bg-black/30 border-purple-500/30 hover:border-purple-500'
//                       }`}
//                       onClick={() => setSelectedContest(contest)}
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
//                               handleDelete(contest._id, contest.title);
//                             }}
//                             className="btn btn-xs btn-outline border-red-500 text-red-400 hover:bg-red-600"
//                             title="Delete Contest"
//                             disabled={deleting}
//                           >
//                             <Trash2 size={14} />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Right Column: Selected Contest Details */}
//           <div>
//             <div className="bg-black/40 border border-red-500/30 rounded-xl p-6 sticky top-6">
//               {selectedContest ? (
//                 <>
//                   <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                  
//                   <div className="mb-6">
//                     <h3 className="font-bold text-lg mb-2">{selectedContest.title}</h3>
//                     <p className="text-gray-400 text-sm mb-4">{selectedContest.description}</p>
                    
//                     <div className="grid grid-cols-2 gap-4 mb-4">
//                       <div className="bg-black/30 p-3 rounded">
//                         <div className="text-sm text-gray-400">Status</div>
//                         <div className={`badge ${getStatusColor(selectedContest.status)}`}>
//                           {selectedContest.status}
//                         </div>
//                       </div>
//                       <div className="bg-black/30 p-3 rounded">
//                         <div className="text-sm text-gray-400">Participants</div>
//                         <div className="text-lg font-bold">{selectedContest.participants?.length || 0}</div>
//                       </div>
//                     </div>

//                     <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
//                       <div className="flex items-start gap-2">
//                         <AlertTriangle size={18} className="text-red-400 mt-0.5" />
//                         <div>
//                           <h4 className="font-bold text-red-300 mb-1">Warning</h4>
//                           <p className="text-red-300/80 text-sm">
//                             Deleting this contest will permanently remove all data including submissions, leaderboard, and participant registrations.
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="mb-6">
//                       <label className="label">
//                         <span className="label-text text-white">
//                           Type <span className="font-bold text-red-400">DELETE</span> to confirm:
//                         </span>
//                       </label>
//                       <input
//                         type="text"
//                         value={confirmText}
//                         onChange={(e) => {
//                           setConfirmText(e.target.value);
//                           if (error) setError('');
//                         }}
//                         placeholder="Type DELETE here"
//                         className="input input-bordered w-full bg-black/50 border-red-500 text-white"
//                       />
//                     </div>

//                     <div className="space-y-3">
//                       <button
//                         onClick={handleDeleteWithConfirmation}
//                         disabled={deleting || confirmText !== 'DELETE'}
//                         className={`btn w-full ${
//                           confirmText === 'DELETE'
//                             ? 'bg-gradient-to-r from-red-600 to-orange-600 border-0 text-white hover:from-red-700 hover:to-orange-700'
//                             : 'bg-gray-700 text-gray-400 cursor-not-allowed'
//                         }`}
//                       >
//                         {deleting ? (
//                           <>
//                             <Loader className="animate-spin mr-2" size={20} />
//                             Deleting...
//                           </>
//                         ) : (
//                           <>
//                             <Trash2 size={20} className="mr-2" />
//                             Delete Contest Permanently
//                           </>
//                         )}
//                       </button>

//                       <button
//                         onClick={() => {
//                           setSelectedContest(null);
//                           setConfirmText('');
//                         }}
//                         className="btn btn-outline w-full border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white"
//                       >
//                         Select Different Contest
//                       </button>
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 <div className="text-center py-8">
//                   <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700/30 border border-gray-600 mb-4">
//                     <AlertTriangle size={28} className="text-gray-400" />
//                   </div>
//                   <h3 className="text-lg font-bold mb-2">No Contest Selected</h3>
//                   <p className="text-gray-400 text-sm">
//                     Select a contest from the list to view deletion details
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Alternative Actions */}
//             <div className="mt-6 text-center">
//               <p className="text-gray-400 text-sm mb-4">
//                 Instead of deleting, you can also:
//               </p>
//               <div className="flex flex-col gap-2">
//                 <Link
//                   to="/admin/contests/create"
//                   className="btn btn-outline btn-sm border-blue-500 text-blue-300 hover:bg-blue-600"
//                 >
//                   Create New Contest
//                 </Link>
//                 <Link
//                   to="/contests"
//                   className="btn btn-outline btn-sm border-purple-500 text-purple-300 hover:bg-purple-600"
//                 >
//                   View All Contests
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Danger Zone */}
//         <div className="mt-8 p-6 border border-red-500/30 rounded-xl bg-red-500/5">
//           <div className="flex items-center gap-3 mb-4">
//             <AlertTriangle size={24} className="text-red-400" />
//             <h3 className="text-xl font-bold text-red-300">Danger Zone</h3>
//           </div>
//           <p className="text-red-300/80 mb-4">
//             Deleting contests is a permanent action. Consider archiving or disabling contests instead if you might need the data later.
//           </p>
//           <div className="text-sm text-gray-400">
//             <p>⚠️ Contest deletion will remove:</p>
//             <ul className="list-disc list-inside mt-2 space-y-1">
//               <li>All contest submissions and solutions</li>
//               <li>Leaderboard rankings and scores</li>
//               <li>Participant registrations</li>
//               <li>Contest statistics and analytics</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DeleteContestPage;