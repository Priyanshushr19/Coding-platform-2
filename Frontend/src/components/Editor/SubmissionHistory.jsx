import { useState, useEffect } from 'react';
import axiosClient from '../../Utils/axiosClient';
import { 
  Clock, Cpu, HardDrive, CheckCircle, XCircle, 
  AlertCircle, Loader, Eye, Code, Calendar,
  Zap, Sparkles, ChevronDown, ChevronUp, FileText
} from 'lucide-react';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        console.log(response);
        
        // Validate and normalize the response data
        const responseData = response.data;
        
        if (Array.isArray(responseData)) {
          setSubmissions(responseData);
        } else if (responseData && Array.isArray(responseData.submissions)) {
          setSubmissions(responseData.submissions);
        } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
          setSubmissions(responseData.data);
        } else {
          console.warn('Unexpected API response format:', responseData);
          setSubmissions([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        const errorMessage = err.message || err.response?.data?.error || err.response?.data?.message || 'Failed to fetch submission history';
        setError(errorMessage);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchSubmissions();
    } else {
      setLoading(false);
      setError('No problem ID provided');
      setSubmissions([]);
    }
  }, [problemId]);

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'accepted':
      case 'success': 
      case 'passed': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'wrong answer':
      case 'wrong': 
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'error':
      case 'runtime error':
      case 'compilation error': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'pending':
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'time limit exceeded': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return <AlertCircle size={14} />;
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'accepted':
      case 'success': 
      case 'passed': return <CheckCircle size={14} />;
      case 'wrong answer':
      case 'wrong': 
      case 'failed': return <XCircle size={14} />;
      case 'error':
      case 'runtime error':
      case 'compilation error': return <AlertCircle size={14} />;
      case 'pending':
      case 'processing': return <Loader size={14} className="animate-spin" />;
      case 'time limit exceeded': return <Clock size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const getStatusDisplayText = (status) => {
    if (!status) return 'Unknown';
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'accepted': return 'Accepted';
      case 'wrong answer': return 'Wrong Answer';
      case 'runtime error': return 'Runtime Error';
      case 'compilation error': return 'Compilation Error';
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'time limit exceeded': return 'Time Limit Exceeded';
      case 'success': return 'Success';
      case 'failed': return 'Failed';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatMemory = (memory) => {
    if (memory === undefined || memory === null) return 'N/A';
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatRuntime = (runtime) => {
    if (runtime === undefined || runtime === null) return 'N/A';
    return `${runtime} sec`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return `Today at ${date.toLocaleTimeString()}`;
      } else if (diffDays === 1) {
        return `Yesterday at ${date.toLocaleTimeString()}`;
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    if (submissions) {
      console.log('Submissions data:', submissions);
      console.log('Type of submissions:', typeof submissions);
      console.log('Is array:', Array.isArray(submissions));
    }
  }, [submissions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Code size={16} className="text-purple-400 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-purple-300">Loading submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-shake">
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400" />
          <span className="text-red-300">{error}</span>
        </div>
      </div>
    );
  }

  const submissionsArray = Array.isArray(submissions) ? submissions : [];

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-70 animate-pulse"></div>
          <div className="relative bg-black rounded-lg p-1">
            <FileText size={20} className="text-purple-400" />
          </div>
        </div>
        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient">
          Submission History
        </span>
      </h2>
      
      {submissionsArray.length === 0 ? (
        <div className="text-center py-12 bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl">
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-50"></div>
            <div className="relative bg-black rounded-full p-4">
              <Code size={40} className="text-purple-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No submissions yet</h3>
          <p className="text-purple-300/70">Start solving to see your submission history!</p>
        </div>
      ) : (
        <>
          <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-900/30 to-purple-800/20 border-b border-purple-500/30">
                    <th className="px-4 py-3 text-left text-sm font-medium text-purple-300 w-16">#</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-purple-300">Language</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-purple-300">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-purple-300">Runtime</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-purple-300">Memory</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-purple-300">Test Cases</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-purple-300">Submitted</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-purple-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {submissionsArray.map((sub, index) => (
                    <tr 
                      key={sub._id || sub.id || index}
                      className="group hover:bg-purple-500/5 transition-all duration-300"
                      onMouseEnter={() => setHoveredRow(sub._id || index)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-white group-hover:text-purple-300 transition-colors">
                          {sub.language || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(sub.status)}`}>
                            {getStatusIcon(sub.status)}
                            {getStatusDisplayText(sub.status)}
                          </span>
                          {hoveredRow === (sub._id || index) && (
                            <span className="flex gap-1">
                              <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></span>
                              <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse animation-delay-200"></span>
                              <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse animation-delay-400"></span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 font-mono text-sm text-gray-300">
                          <Clock size={14} className="text-purple-400" />
                          {formatRuntime(sub.runtime)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 font-mono text-sm text-gray-300">
                          <HardDrive size={14} className="text-purple-400" />
                          {formatMemory(sub.memory)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 font-mono text-sm">
                          <span className={sub.testCasesPassed === sub.testCasesTotal && sub.testCasesTotal ? 'text-green-400' : 'text-yellow-400'}>
                            {sub.testCasesPassed ?? 'N/A'}/{sub.testCasesTotal ?? 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Calendar size={14} className="text-purple-400" />
                          <span title={new Date(sub.createdAt || sub.submittedAt).toLocaleString()}>
                            {formatDate(sub.createdAt || sub.submittedAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          className="group/btn relative px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 hover:text-white hover:border-purple-400 transition-all duration-300 overflow-hidden"
                          onClick={() => setSelectedSubmission(sub)}
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
                          <span className="relative flex items-center gap-1 text-xs">
                            <Eye size={14} />
                            View Code
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 text-sm text-purple-300/70 flex items-center justify-end gap-2">
            <Sparkles size={14} className="text-yellow-400" />
            Showing {submissionsArray.length} submission{submissionsArray.length !== 1 ? 's' : ''}
          </div>
        </>
      )}

      {/* Code View Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="relative w-11/12 max-w-5xl">
            {/* Animated border */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 animate-pulse"></div>
            
            <div className="relative bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Code size={20} className="text-purple-400" />
                    Submission Details: {selectedSubmission.language || 'Unknown Language'}
                  </h3>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="p-1 hover:bg-purple-500/20 rounded-lg transition-colors"
                  >
                    <XCircle size={20} className="text-gray-400" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getStatusColor(selectedSubmission.status)}`}>
                      {getStatusIcon(selectedSubmission.status)}
                      {getStatusDisplayText(selectedSubmission.status)}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm text-purple-300 flex items-center gap-1">
                      <Clock size={14} />
                      Runtime: {formatRuntime(selectedSubmission.runtime)}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm text-purple-300 flex items-center gap-1">
                      <HardDrive size={14} />
                      Memory: {formatMemory(selectedSubmission.memory)}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm text-purple-300 flex items-center gap-1">
                      <Zap size={14} />
                      Passed: {selectedSubmission.testCasesPassed ?? 'N/A'}/{selectedSubmission.testCasesTotal ?? 'N/A'}
                    </span>
                  </div>
                  
                  {(selectedSubmission.errorMessage || selectedSubmission.error) && (
                    <div className="mt-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-red-300 text-sm break-words">
                          {selectedSubmission.errorMessage || selectedSubmission.error}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="max-h-96 overflow-auto rounded-lg border border-purple-500/30 bg-black/50">
                  <pre className="p-4 text-gray-300 font-mono text-sm overflow-x-auto">
                    <code className="whitespace-pre-wrap break-words">
                      {selectedSubmission.code || selectedSubmission.solution || 'No code available'}
                    </code>
                  </pre>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button 
                    className="group relative px-6 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 hover:text-white hover:border-purple-400 transition-all duration-300 overflow-hidden"
                    onClick={() => setSelectedSubmission(null)}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    <span className="relative">Close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
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
        
        .bg-300\% {
          background-size: 300%;
        }
      `}</style>
    </div>
  );
};

export default SubmissionHistory;

// import { useState, useEffect } from 'react';
// import axiosClient from '../../Utils/axiosClient';

// const SubmissionHistory = ({ problemId }) => {
//   const [submissions, setSubmissions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedSubmission, setSelectedSubmission] = useState(null);

//   useEffect(() => {
//     const fetchSubmissions = async () => {
//       try {
//         setLoading(true);
//         const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
//         console.log(response);
        
//         // Validate and normalize the response data
//         const responseData = response.data;
        
//         if (Array.isArray(responseData)) {
//           setSubmissions(responseData);
//         } else if (responseData && Array.isArray(responseData.submissions)) {
//           setSubmissions(responseData.submissions);
//         } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
//           setSubmissions(responseData.data);
//         } else {
//           console.warn('Unexpected API response format:', responseData);
//           setSubmissions([]); // Set to empty array if format is unexpected
//         }
        
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching submissions:', err);
//         // Normalize error message extraction
//         const errorMessage = err.message || err.response?.data?.error || err.response?.data?.message || 'Failed to fetch submission history';
//         setError(errorMessage);
//         setSubmissions([]); // Ensure submissions is always an array
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (problemId) {
//       fetchSubmissions();
//     } else {
//       setLoading(false);
//       setError('No problem ID provided');
//       setSubmissions([]);
//     }
//   }, [problemId]);

//   const getStatusColor = (status) => {
//     if (!status) return 'badge-neutral';
    
//     const statusLower = status.toLowerCase();
//     switch (statusLower) {
//       case 'accepted':
//       case 'success': 
//       case 'passed': return 'badge-success';
//       case 'wrong answer':
//       case 'wrong': 
//       case 'failed': return 'badge-error';
//       case 'error':
//       case 'runtime error':
//       case 'compilation error': return 'badge-warning';
//       case 'pending':
//       case 'processing': return 'badge-info';
//       case 'time limit exceeded': return 'badge-warning';
//       default: return 'badge-neutral';
//     }
//   };

//   const getStatusDisplayText = (status) => {
//     if (!status) return 'Unknown';
    
//     const statusLower = status.toLowerCase();
//     switch (statusLower) {
//       case 'accepted': return 'Accepted';
//       case 'wrong answer': return 'Wrong Answer';
//       case 'runtime error': return 'Runtime Error';
//       case 'compilation error': return 'Compilation Error';
//       case 'pending': return 'Pending';
//       case 'processing': return 'Processing';
//       case 'time limit exceeded': return 'Time Limit Exceeded';
//       case 'success': return 'Success';
//       case 'failed': return 'Failed';
//       default: return status.charAt(0).toUpperCase() + status.slice(1);
//     }
//   };

//   const formatMemory = (memory) => {
//     if (memory === undefined || memory === null) return 'N/A';
//     if (memory < 1024) return `${memory} kB`;
//     return `${(memory / 1024).toFixed(2)} MB`;
//   };

//   const formatRuntime = (runtime) => {
//     if (runtime === undefined || runtime === null) return 'N/A';
//     return `${runtime} sec`;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleString();
//     } catch (error) {
//       return 'Invalid Date';
//     }
//   };

//   // Debug: Log the submissions data to see what we're getting
//   useEffect(() => {
//     if (submissions) {
//       console.log('Submissions data:', submissions);
//       console.log('Type of submissions:', typeof submissions);
//       console.log('Is array:', Array.isArray(submissions));
//     }
//   }, [submissions]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <span className="loading loading-spinner loading-lg"></span>
//         <span className="ml-2">Loading submissions...</span>
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

//   // Ensure submissions is always an array before mapping
//   const submissionsArray = Array.isArray(submissions) ? submissions : [];

//   return (
//     <div className="container mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-6 text-center">Submission History</h2>
      
//       {submissionsArray.length === 0 ? (
//         <div className="alert alert-info shadow-lg">
//           <div>
//             <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//             </svg>
//             <span>No submissions found for this problem</span>
//           </div>
//         </div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="table table-zebra w-full">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Language</th>
//                   <th>Status</th>
//                   <th>Runtime</th>
//                   <th>Memory</th>
//                   <th>Test Cases</th>
//                   <th>Submitted</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {submissionsArray.map((sub, index) => (
//                   <tr key={sub._id || sub.id || index}>
//                     <td>{index + 1}</td>
//                     <td className="font-mono">{sub.language || 'N/A'}</td>
//                     <td>
//                       <span className={`badge ${getStatusColor(sub.status)}`}>
//                         {getStatusDisplayText(sub.status)}
//                       </span>
//                     </td>
//                     <td className="font-mono">{formatRuntime(sub.runtime)}</td>
//                     <td className="font-mono">{formatMemory(sub.memory)}</td>
//                     <td className="font-mono">
//                       {sub.testCasesPassed ?? 'N/A'}/{sub.testCasesTotal ?? 'N/A'}
//                     </td>
//                     <td>{formatDate(sub.createdAt || sub.submittedAt)}</td>
//                     <td>
//                       <button 
//                         className="btn btn-sm btn-outline"
//                         onClick={() => setSelectedSubmission(sub)}
//                       >
//                         View Code
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <p className="mt-4 text-sm text-gray-500">
//             Showing {submissionsArray.length} submission{submissionsArray.length !== 1 ? 's' : ''}
//           </p>
//         </>
//       )}

//       {/* Code View Modal */}
//       {selectedSubmission && (
//         <div className="modal modal-open">
//           <div className="modal-box w-11/12 max-w-5xl">
//             <h3 className="font-bold text-lg mb-4">
//               Submission Details: {selectedSubmission.language || 'Unknown Language'}
//             </h3>
            
//             <div className="mb-4">
//               <div className="flex flex-wrap gap-2 mb-2">
//                 <span className={`badge ${getStatusColor(selectedSubmission.status)}`}>
//                   {getStatusDisplayText(selectedSubmission.status)}
//                 </span>
//                 <span className="badge badge-outline">
//                   Runtime: {formatRuntime(selectedSubmission.runtime)}
//                 </span>
//                 <span className="badge badge-outline">
//                   Memory: {formatMemory(selectedSubmission.memory)}
//                 </span>
//                 <span className="badge badge-outline">
//                   Passed: {selectedSubmission.testCasesPassed ?? 'N/A'}/{selectedSubmission.testCasesTotal ?? 'N/A'}
//                 </span>
//               </div>
              
//               {(selectedSubmission.errorMessage || selectedSubmission.error) && (
//                 <div className="alert alert-error mt-2">
//                   <div>
//                     <span className="break-words">
//                       {selectedSubmission.errorMessage || selectedSubmission.error}
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             <div className="max-h-96 overflow-auto">
//               <pre className="p-4 bg-gray-900 text-gray-100 rounded overflow-x-auto">
//                 <code className="whitespace-pre-wrap break-words">
//                   {selectedSubmission.code || selectedSubmission.solution || 'No code available'}
//                 </code>
//               </pre>
//             </div>
            
//             <div className="modal-action">
//               <button 
//                 className="btn"
//                 onClick={() => setSelectedSubmission(null)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SubmissionHistory;