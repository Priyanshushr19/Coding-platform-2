import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MessageSquare, ThumbsUp, ThumbsDown, Plus, Send, 
  Sparkles, X, ChevronDown, ChevronUp, User,
  Clock, Tag, AlertCircle, CheckCircle
} from 'lucide-react';
import axiosClient from '../../Utils/axiosClient';

const ProblemDiscussion = () => {
  const [discussions, setDiscussions] = useState([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [hoveredPost, setHoveredPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { problemId } = useParams();

  useEffect(() => {
    fetchProblemDiscussions();
  }, [problemId]);

  const fetchProblemDiscussions = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get(`/discussion/problem/${problemId}`);
      setDiscussions(data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    try {
      const tags = newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await axiosClient.post('/discussion', {
        ...newPost,
        tags,
        problemId
      });
      setNewPost({ title: '', content: '', tags: '' });
      setShowNewPost(false);
      fetchProblemDiscussions();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const addReply = async (discussionId) => {
    try {
      await axiosClient.post(`/discussion/${discussionId}/reply`, {
        content: replyContent
      });
      setReplyContent('');
      setReplyingTo(null);
      fetchProblemDiscussions();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleLike = async (discussionId) => {
    try {
      await axiosClient.post(`/discussion/${discussionId}/like`);
      fetchProblemDiscussions();
    } catch (error) {
      console.error('Error liking:', error);
    }
  };

  const handleDislike = async (discussionId) => {
    try {
      await axiosClient.post(`/discussion/${discussionId}/dislike`);
      fetchProblemDiscussions();
    } catch (error) {
      console.error('Error disliking:', error);
    }
  };

  const handleReplyLike = async (discussionId, replyId) => {
    try {
      await axiosClient.post(`/discussion/${discussionId}/reply/${replyId}/like`);
      fetchProblemDiscussions();
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  const toggleReplies = (discussionId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [discussionId]: !prev[discussionId]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <MessageSquare size={16} className="text-purple-400 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black text-white overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-slideIn">
          <div>
            <h1 className="text-3xl font-black mb-2">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient">
                Problem Discussions
              </span>
            </h1>
            <p className="text-purple-300/80 flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400" />
              Discuss solutions and ask questions about this problem
            </p>
          </div>
          
          <button
            onClick={() => setShowNewPost(true)}
            className="group relative px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            <span className="relative flex items-center gap-2">
              <Plus size={18} />
              New Question
            </span>
          </button>
        </div>

        {/* New Post Modal */}
        {showNewPost && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="relative w-full max-w-2xl">
              {/* Animated border */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 animate-pulse"></div>
              
              <div className="relative bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <MessageSquare size={20} className="text-purple-400" />
                    Ask a Question
                  </h2>
                  <button
                    onClick={() => setShowNewPost(false)}
                    className="p-1 hover:bg-purple-500/20 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                    <input
                      type="text"
                      placeholder="Question Title"
                      value={newPost.title}
                      onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                      className="relative w-full px-4 py-3 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all"
                    />
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                    <textarea
                      placeholder="Describe your question or share your approach..."
                      value={newPost.content}
                      onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                      rows="4"
                      className="relative w-full px-4 py-3 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all"
                    />
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                    <input
                      type="text"
                      placeholder="Tags (comma separated) e.g. algorithm, optimization, bug"
                      value={newPost.tags}
                      onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                      className="relative w-full px-4 py-3 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all"
                    />
                  </div>
                  
                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      onClick={() => setShowNewPost(false)}
                      className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 hover:text-white hover:border-purple-400 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createPost}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    >
                      Post Question
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Discussions List */}
        <div className="space-y-6">
          {discussions.map((discussion, index) => (
            <div
              key={discussion._id}
              className="group relative bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 hover:border-purple-400 transition-all duration-500 hover:shadow-[0_0_30px_rgba(128,0,128,0.2)] animate-slideIn"
              style={{ animationDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredPost(discussion._id)}
              onMouseLeave={() => setHoveredPost(null)}
            >
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl"></div>
              
              <div className="relative">
                {/* Discussion Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-50"></div>
                      <img
                        src={discussion.author.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        className="relative w-10 h-10 rounded-full border-2 border-purple-500 object-cover"
                        alt="profile"
                      />
                      {hoveredPost === discussion._id && (
                        <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-black rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        {discussion.author.firstName}
                        {discussion.author.role === 'admin' && (
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">Admin</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-purple-300 text-sm">
                        <Clock size={12} />
                        <span>{formatDate(discussion.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {discussion.tags?.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs text-purple-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Discussion Content */}
                <h2 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                  {discussion.title}
                </h2>
                <p className="text-gray-300 mb-4 whitespace-pre-wrap leading-relaxed">
                  {discussion.content}
                </p>

                {/* Discussion Actions */}
                <div className="flex items-center gap-6 mb-4">
                  <button
                    onClick={() => handleLike(discussion._id)}
                    className={`group/btn flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                      discussion.likes.includes(user?.id) 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'text-gray-400 hover:bg-purple-500/10 hover:text-white'
                    }`}
                  >
                    <ThumbsUp size={18} className="group-hover/btn:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{discussion.likes.length}</span>
                  </button>
                  
                  <button
                    onClick={() => handleDislike(discussion._id)}
                    className={`group/btn flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                      discussion.dislikes.includes(user?.id) 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'text-gray-400 hover:bg-purple-500/10 hover:text-white'
                    }`}
                  >
                    <ThumbsDown size={18} className="group-hover/btn:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{discussion.dislikes.length}</span>
                  </button>
                  
                  <button
                    onClick={() => setReplyingTo(replyingTo === discussion._id ? null : discussion._id)}
                    className={`group/btn flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                      replyingTo === discussion._id
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-gray-400 hover:bg-purple-500/10 hover:text-white'
                    }`}
                  >
                    <MessageSquare size={18} className="group-hover/btn:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{discussion.replies.length} replies</span>
                  </button>

                  {discussion.replies.length > 0 && (
                    <button
                      onClick={() => toggleReplies(discussion._id)}
                      className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors ml-auto"
                    >
                      {expandedReplies[discussion._id] ? (
                        <>
                          <ChevronUp size={16} />
                          <span className="text-xs">Hide replies</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          <span className="text-xs">Show replies</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Reply Input */}
                {replyingTo === discussion._id && (
                  <div className="mb-4 animate-slideDown">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        rows="3"
                        className="relative w-full px-4 py-3 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all"
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => addReply(discussion._id)}
                        className="group/btn relative px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                      >
                        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
                        <span className="relative flex items-center gap-2">
                          <Send size={14} />
                          Post Reply
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {discussion.replies.length > 0 && expandedReplies[discussion._id] && (
                  <div className="border-t border-purple-500/30 pt-4 mt-4 animate-slideDown">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare size={14} className="text-purple-400" />
                      Replies ({discussion.replies.length})
                    </h4>
                    
                    <div className="space-y-3">
                      {discussion.replies.map((reply, replyIndex) => (
                        <div
                          key={reply._id}
                          className="group/reply bg-black/30 border border-purple-500/20 rounded-lg p-4 hover:border-purple-400 transition-all duration-300"
                          style={{ animationDelay: `${replyIndex * 50}ms` }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <img
                                  src={reply.author.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                  className="w-6 h-6 rounded-full border border-purple-500 object-cover"
                                  alt="profile"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-white text-sm font-medium">
                                  {reply.author.firstName}
                                </span>
                                <span className="text-purple-300 text-xs flex items-center gap-1">
                                  <Clock size={10} />
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleReplyLike(discussion._id, reply._id)}
                              className={`group/btn flex items-center gap-1 px-2 py-1 rounded transition-all ${
                                reply.likes.includes(user?.id)
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'text-gray-400 hover:bg-purple-500/10 hover:text-white'
                              }`}
                            >
                              <ThumbsUp size={12} className="group-hover/btn:scale-110 transition-transform" />
                              <span className="text-xs">{reply.likes.length}</span>
                            </button>
                          </div>
                          
                          <p className="text-gray-300 text-sm whitespace-pre-wrap pl-8">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {discussions.length === 0 && (
          <div className="text-center py-16 bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl animate-scaleIn">
            <div className="relative inline-block mb-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-50"></div>
              <div className="relative bg-black rounded-full p-4">
                <MessageSquare size={48} className="text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No discussions yet</h3>
            <p className="text-purple-300/80 mb-6 max-w-md mx-auto">
              Be the first to ask a question about this problem!
            </p>
            <button
              onClick={() => setShowNewPost(true)}
              className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
            >
              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              <span className="relative flex items-center gap-2">
                <Plus size={20} />
                Start Discussion
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
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
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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
        
        .animate-gradient {
          background-size: 300% 300%;
          animation: gradient 6s ease infinite;
        }
        
        .animate-slideIn {
          animation: slideIn 0.6s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
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
      `}</style>
    </div>
  );
};

export default ProblemDiscussion;

// import { useState, useEffect } from 'react';
// import { useParams } from 'react-router';
// import { useDispatch, useSelector } from 'react-redux';
// import { MessageSquare, ThumbsUp, ThumbsDown, Plus, Send } from 'lucide-react';
// import axiosClient from '../../Utils/axiosClient';

// const ProblemDiscussion = () => {
//   const [discussions, setDiscussions] = useState([]);
//   const [showNewPost, setShowNewPost] = useState(false);
//   const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
//   const [replyingTo, setReplyingTo] = useState(null);
//   const [replyContent, setReplyContent] = useState('');
//   const { user } = useSelector((state) => state.auth);
//   const { problemId } = useParams();

//   useEffect(() => {
//     fetchProblemDiscussions();
//   }, [problemId]);

//   const fetchProblemDiscussions = async () => {
//     try {
//       const { data } = await axiosClient.get(`/discussion/problem/${problemId}`);
//       setDiscussions(data);
//     } catch (error) {
//       console.error('Error fetching discussions:', error);
//     }
//   };

//   const createPost = async () => {
//     try {
//       const tags = newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
//       await axiosClient.post('/discussion', {
//         ...newPost,
//         tags,
//         problemId // Include problemId in the post
//       });
//       setNewPost({ title: '', content: '', tags: '' });
//       setShowNewPost(false);
//       fetchProblemDiscussions();
//     } catch (error) {
//       console.error('Error creating post:', error);
//     }
//   };

//   // ... rest of the functions (addReply, handleLike, handleDislike, handleReplyLike) remain the same
//   const addReply = async (discussionId) => {
//     try {
//       await axiosClient.post(`/discussion/${discussionId}/reply`, {
//         content: replyContent
//       });
//       setReplyContent('');
//       setReplyingTo(null);
//       fetchProblemDiscussions();
//     } catch (error) {
//       console.error('Error adding reply:', error);
//     }
//   };

//   const handleLike = async (discussionId) => {
//     try {
//       await axiosClient.post(`/discussion/${discussionId}/like`);
//       fetchProblemDiscussions();
//     } catch (error) {
//       console.error('Error liking:', error);
//     }
//   };

//   const handleDislike = async (discussionId) => {
//     try {
//       await axiosClient.post(`/discussion/${discussionId}/dislike`);
//       fetchProblemDiscussions();
//     } catch (error) {
//       console.error('Error disliking:', error);
//     }
//   };

//   const handleReplyLike = async (discussionId, replyId) => {
//     try {
//       await axiosClient.post(`/discussion/${discussionId}/reply/${replyId}/like`);
//       fetchProblemDiscussions();
//     } catch (error) {
//       console.error('Error liking reply:', error);
//     }
//   };

//   return (
//     <div className="h-[85vh] bg-gradient-to-br w-[800px] justify-between  from-purple-900 to-black p-6 ">
//       <div className="max-w-xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-white mb-2">Problem Discussions</h1>
//             <p className="text-purple-300">Discuss solutions and ask questions about this problem</p>
//           </div>
//           <button
//             onClick={() => setShowNewPost(true)}
//             className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
//           >
//             <Plus size={20} className="mr-2" />
//             New Question
//           </button>
//         </div>

//         {/* New Post Modal */}
//         {showNewPost && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//             <div className="bg-black border border-purple-500 rounded-lg p-6 w-full max-w-2xl">
//               <h2 className="text-xl font-bold text-white mb-4">Ask a Question</h2>
//               <div className="space-y-4">
//                 <input
//                   type="text"
//                   placeholder="Question Title"
//                   value={newPost.title}
//                   onChange={(e) => setNewPost({...newPost, title: e.target.value})}
//                   className="input input-bordered w-full bg-black border-purple-500 text-white"
//                 />
//                 <textarea
//                   placeholder="Describe your question or share your approach..."
//                   value={newPost.content}
//                   onChange={(e) => setNewPost({...newPost, content: e.target.value})}
//                   className="textarea textarea-bordered w-full h-32 bg-black border-purple-500 text-white"
//                 />
//                 <input
//                   type="text"
//                   placeholder="Tags (comma separated) e.g. algorithm, optimization, bug"
//                   value={newPost.tags}
//                   onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
//                   className="input input-bordered w-full bg-black border-purple-500 text-white"
//                 />
//                 <div className="flex gap-2 justify-end">
//                   <button
//                     onClick={() => setShowNewPost(false)}
//                     className="btn btn-ghost text-white"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={createPost}
//                     className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
//                   >
//                     Post Question
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Discussions List */}
//         <div className="space-y-6">
//           {discussions.map((discussion) => (
//             <div key={discussion._id} className="bg-black/50 border border-purple-500/30 rounded-lg p-6">
//               {/* Discussion Header */}
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   <img
//                     src={discussion.author.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
//                     className="w-10 h-10 rounded-full border-2 border-purple-500"
//                     alt="profile"
//                   />
//                   <div>
//                     <h3 className="text-white font-semibold">{discussion.author.firstName}</h3>
//                     <p className="text-purple-300 text-sm">
//                       {new Date(discussion.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   {discussion.tags?.map((tag, index) => (
//                     <span key={index} className="badge bg-purple-500/20 text-purple-300 border-purple-500">
//                       {tag}
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               {/* Discussion Content */}
//               <h2 className="text-xl font-bold text-white mb-3">{discussion.title}</h2>
//               <p className="text-gray-300 mb-4 whitespace-pre-wrap">{discussion.content}</p>

//               {/* Discussion Actions */}
//               <div className="flex items-center gap-6 mb-4">
//                 <button
//                   onClick={() => handleLike(discussion._id)}
//                   className={`flex items-center gap-2 ${discussion.likes.includes(user?.id) ? 'text-green-400' : 'text-gray-400'}`}
//                 >
//                   <ThumbsUp size={18} />
//                   <span>{discussion.likes.length}</span>
//                 </button>
//                 <button
//                   onClick={() => handleDislike(discussion._id)}
//                   className={`flex items-center gap-2 ${discussion.dislikes.includes(user?.id) ? 'text-red-400' : 'text-gray-400'}`}
//                 >
//                   <ThumbsDown size={18} />
//                   <span>{discussion.dislikes.length}</span>
//                 </button>
//                 <button
//                   onClick={() => setReplyingTo(replyingTo === discussion._id ? null : discussion._id)}
//                   className="flex items-center gap-2 text-purple-400"
//                 >
//                   <MessageSquare size={18} />
//                   <span>{discussion.replies.length} replies</span>
//                 </button>
//               </div>

//               {/* Reply Input */}
//               {replyingTo === discussion._id && (
//                 <div className="mb-4">
//                   <textarea
//                     value={replyContent}
//                     onChange={(e) => setReplyContent(e.target.value)}
//                     placeholder="Write your reply..."
//                     className="textarea textarea-bordered w-full bg-black border-purple-500 text-white mb-2"
//                     rows="3"
//                   />
//                   <div className="flex justify-end">
//                     <button
//                       onClick={() => addReply(discussion._id)}
//                       className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700 btn-sm"
//                     >
//                       <Send size={16} className="mr-1" />
//                       Reply
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Replies */}
//               {discussion.replies.length > 0 && (
//                 <div className="border-t border-purple-500/30 pt-4">
//                   <h4 className="text-white font-semibold mb-3">Replies ({discussion.replies.length})</h4>
//                   <div className="space-y-4">
//                     {discussion.replies.map((reply) => (
//                       <div key={reply._id} className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
//                         <div className="flex items-start justify-between mb-2">
//                           <div className="flex items-center gap-2">
//                             <img
//                               src={reply.author.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
//                               className="w-8 h-8 rounded-full border border-purple-500"
//                               alt="profile"
//                             />
//                             <span className="text-white text-sm font-medium">
//                               {reply.author.firstName}
//                             </span>
//                             <span className="text-purple-300 text-xs">
//                               {new Date(reply.createdAt).toLocaleDateString()}
//                             </span>
//                           </div>
//                           <button
//                             onClick={() => handleReplyLike(discussion._id, reply._id)}
//                             className={`flex items-center gap-1 ${reply.likes.includes(user?.id) ? 'text-green-400' : 'text-gray-400'}`}
//                           >
//                             <ThumbsUp size={14} />
//                             <span className="text-xs">{reply.likes.length}</span>
//                           </button>
//                         </div>
//                         <p className="text-gray-300 text-sm whitespace-pre-wrap">{reply.content}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Empty State */}
//         {discussions.length === 0 && (
//           <div className="text-center py-12">
//             <MessageSquare size={64} className="mx-auto text-purple-400 mb-4" />
//             <h3 className="text-xl font-bold text-white mb-2">No discussions yet</h3>
//             <p className="text-purple-300 mb-6">Be the first to ask a question about this problem!</p>
//             <button
//               onClick={() => setShowNewPost(true)}
//               className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
//             >
//               <Plus size={20} className="mr-2" />
//               Start Discussion
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProblemDiscussion;