import { useEffect, useState } from 'react';
import axiosClient from '../../Utils/axiosClient'
import { useLocation } from 'react-router';
import { 
  Trash2, AlertTriangle, RefreshCw, Search, 
  Filter, XCircle, ChevronLeft, ChevronRight,
  Loader, Shield, Zap, Sparkles
} from 'lucide-react';

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const problemsPerPage = 10;

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    
    setDeleteLoading(id);
    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      setProblems(problems.filter(problem => problem._id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete problem');
      console.error(err);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Filter problems based on search and difficulty
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = searchTerm === '' || 
      problem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.tags?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = selectedDifficulty === 'all' || 
      problem.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();
    
    return matchesSearch && matchesDifficulty;
  });

  // Pagination
  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
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
              <Trash2 size={32} className="text-purple-400 animate-pulse" />
            </div>
          </div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-xl font-bold animate-pulse">
            Loading problems...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md w-full text-center animate-shake">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={fetchProblems}
            className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 hover:bg-red-500/30 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(128, 0, 128, 0.15) 1px, transparent 0)',
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* Gradient orbs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-600/30 rounded-full filter blur-[128px] animate-pulse"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-pink-600/30 rounded-full filter blur-[128px] animate-pulse animation-delay-2000"></div>
      
      {/* Floating elements */}
      <div className="absolute top-40 right-20 text-purple-500/10 animate-float">
        <Shield size={100} />
      </div>
      <div className="absolute bottom-40 left-20 text-purple-500/10 animate-float animation-delay-1000">
        <Zap size={80} />
      </div>

      <div className="relative z-10 container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="animate-slideIn">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg blur opacity-70 animate-pulse"></div>
                <div className="relative bg-black rounded-lg p-2">
                  <Trash2 size={24} className="text-red-400" />
                </div>
              </div>
              <h1 className="text-4xl font-black">
                <span className="bg-gradient-to-r from-red-400 via-pink-400 to-red-400 bg-clip-text text-transparent bg-300% animate-gradient">
                  Delete Problems
                </span>
              </h1>
            </div>
            <p className="text-purple-300/80 flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400" />
              Manage and remove problems from the platform
            </p>
          </div>

          <button
            onClick={fetchProblems}
            className="group relative px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 hover:text-white hover:border-purple-400 transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            <span className="relative flex items-center gap-2">
              <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slideIn animation-delay-200">
          <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">{problems.length}</div>
            <div className="text-sm text-purple-300">Total Problems</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">
              {problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length}
            </div>
            <div className="text-sm text-green-300">Easy Problems</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-red-500/30 rounded-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">
              {problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length}
            </div>
            <div className="text-sm text-red-300">Hard Problems</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 animate-slideIn animation-delay-400">
          <div className="flex-1 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
              <input
                type="text"
                placeholder="Search problems by title or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all"
              />
            </div>
          </div>
          
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white outline-none focus:border-purple-400 transition-all"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Problems Table */}
        <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl overflow-hidden animate-slideIn animation-delay-600">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-900/30 to-purple-800/20 border-b border-purple-500/30">
                  <th className="px-4 py-3 text-left text-sm font-medium text-purple-300 w-16">#</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-purple-300">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-purple-300 w-24">Difficulty</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-purple-300 w-32">Tags</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-purple-300 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {currentProblems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Search size={48} className="text-purple-400 mb-4 opacity-50" />
                        <p className="text-purple-300 text-lg">No problems found</p>
                        <p className="text-purple-400/60 text-sm mt-2">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentProblems.map((problem, index) => (
                    <tr 
                      key={problem._id}
                      className="group hover:bg-purple-500/5 transition-all duration-300"
                      onMouseEnter={() => setHoveredRow(problem._id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {indexOfFirstProblem + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white group-hover:text-purple-300 transition-colors">
                            {problem.title}
                          </span>
                          {hoveredRow === problem._id && (
                            <span className="flex gap-1">
                              <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></span>
                              <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse animation-delay-200"></span>
                              <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse animation-delay-400"></span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded-full text-xs border border-purple-500/30">
                          {problem.tags || 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(problem._id)}
                          disabled={deleteLoading === problem._id}
                          className="group/btn relative px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:text-white hover:border-red-400 hover:bg-red-500/20 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
                          <span className="relative flex items-center gap-1">
                            {deleteLoading === problem._id ? (
                              <>
                                <Loader size={14} className="animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 size={14} />
                                Delete
                              </>
                            )}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-purple-500/30">
              <div className="text-sm text-purple-300">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 bg-black/50 border border-purple-500/30 rounded-lg text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-400 hover:text-white transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white'
                          : 'bg-black/50 border border-purple-500/30 text-purple-300 hover:border-purple-400 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 bg-black/50 border border-purple-500/30 rounded-lg text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-400 hover:text-white transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Message */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg animate-slideIn animation-delay-800">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-300 mb-1">Warning</h3>
              <p className="text-sm text-yellow-300/70">
                Deleting a problem is permanent and cannot be undone. This action will remove the problem and all associated submissions and discussions.
              </p>
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
      `}</style>
    </div>
  );
};

export default AdminDelete;

// import { useEffect, useState } from 'react';
// import axiosClient from '../../Utils/axiosClient'
// import { useLocation } from 'react-router';

// const AdminDelete = () => {
//   const [problems, setProblems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);



//   useEffect(() => {
//     fetchProblems();
//   }, []);

//   const fetchProblems = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axiosClient.get('/problem/getAllProblem');
//       setProblems(data);
//     } catch (err) {
//       setError('Failed to fetch problems');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this problem?')) return;
    
//     try {
//       await axiosClient.delete(`/problem/delete/${id}`);
//       setProblems(problems.filter(problem => problem._id !== id));
//     } catch (err) {
//       setError('Failed to delete problem');
//       console.error(err);
//     }
//   };


//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <span className="loading loading-spinner loading-lg"></span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="alert alert-error shadow-lg my-4">
//         <div>
//           <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <span>{error}</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Delete Problems</h1>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="table table-zebra w-full">
//           <thead>
//             <tr>
//               <th className="w-1/12">#</th>
//               <th className="w-4/12">Title</th>
//               <th className="w-2/12">Difficulty</th>
//               <th className="w-3/12">Tags</th>
//               <th className="w-2/12">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {problems.map((problem, index) => (
//               <tr key={problem._id}>
//                 <th>{index + 1}</th>
//                 <td>{problem.title}</td>
//                 <td>
//                   <span className={`badge ${
//                     problem.difficulty === 'Easy' 
//                       ? 'badge-success' 
//                       : problem.difficulty === 'Medium' 
//                         ? 'badge-warning' 
//                         : 'badge-error'
//                   }`}>
//                     {problem.difficulty}
//                   </span>
//                 </td>
//                 <td>
//                   <span className="badge badge-outline">
//                     {problem.tags}
//                   </span>
//                 </td>
//                 <td>
//                   <div className="flex space-x-2">
//                     <button 
//                       onClick={() => handleDelete(problem._id)}
//                       className="btn btn-sm btn-error"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AdminDelete;
