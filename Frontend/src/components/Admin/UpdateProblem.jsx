import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import axiosClient from '../../Utils/axiosClient';
import { 
  Save, ArrowLeft, Loader, AlertCircle, 
  CheckCircle, Edit, FileText, Tag, 
  Sparkles, Zap, Shield, RefreshCw,
  ChevronDown, ChevronUp, Info, Code
} from 'lucide-react';

const UpdateProblemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    tags: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [problem, setProblem] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    debug: false
  });
  const [hoveredButton, setHoveredButton] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProblem();
    } else {
      setError('No problem ID provided');
      setLoading(false);
    }
  }, [id]);

  // In the fetchProblem function, update it to:
  const fetchProblem = async () => {
    try {
      console.log('Fetching problem with ID:', id);
      const response = await axiosClient.get(`/problem/problemById/${id}`);
      console.log('Full API response:', response);
      console.log('Response data:', response.data);
      console.log('Type of data:', typeof response.data);
      console.log('Keys in data:', Object.keys(response.data));

      // If data is nested inside another property
      const data = response.data.data || response.data.problem || response.data;
      console.log('Extracted data:', data);

      if (!data) {
        throw new Error('No data returned from server');
      }

      setProblem(data);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        difficulty: data.difficulty || 'medium',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || '',
        visibleTestCases: data.visibleTestCases || [],
        hiddenTestCases: data.hiddenTestCases || [],
        startCode: data.startCode || [],
        referenceSolution: data.referenceSolution || []
      });

      console.log('Reference solution from API:', data.referenceSolution);
      console.log('Type of referenceSolution:', typeof data.referenceSolution);

    } catch (err) {
      console.error('Error fetching problem:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch problem');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError('');
      
      console.log('Submitting update for problem ID:', id);
      console.log('Form tags value:', formData.tags);
      
      // Convert tags back to string format (matching the original 'array' string)
      // If tags is a comma-separated string like "array, string", keep it as is
      // If it's an array, join it back to a string
      let tagsToSend = formData.tags;
      
      // If formData.tags is already a string (which it should be), use it directly
      if (typeof tagsToSend !== 'string') {
        // If somehow it's an array, join it
        tagsToSend = Array.isArray(tagsToSend) ? tagsToSend.join(', ') : String(tagsToSend);
      }
      
      // Send tags as a STRING, not an array
      const submitData = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        tags: tagsToSend, // Send as string
        visibleTestCases: problem?.visibleTestCases || [],
        hiddenTestCases: problem?.hiddenTestCases || [],
        startCode: problem?.startCode || [],
        referenceSolution: problem?.referenceSolution || []
      };
      
      console.log('Submit data:', submitData);
      console.log('Tags type:', typeof submitData.tags);
      console.log('Tags value:', submitData.tags);
      
      const response = await axiosClient.put(`/problem/update/${id}`, submitData);
      console.log('Update response:', response);
      
      // Show success message
      alert('Problem updated successfully!');
      navigate('/admin/update');
      
    } catch (err) {
      console.error('Update error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to update problem';
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

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
            Loading problem details...
          </p>
          <p className="text-purple-300/60 text-sm mt-2">ID: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden py-8">
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
        <Code size={100} />
      </div>
      <div className="absolute bottom-40 left-20 text-purple-500/10 animate-float animation-delay-1000">
        <Edit size={80} />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-slideIn">
          <button
            onClick={() => navigate('/admin/update')}
            className="group relative px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 hover:text-white hover:border-purple-400 transition-all duration-300 overflow-hidden mb-4"
            onMouseEnter={() => setHoveredButton('back')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            <span className="relative flex items-center gap-2">
              <ArrowLeft size={16} className={hoveredButton === 'back' ? '-translate-x-1 transition-transform' : ''} />
              Back to Problems List
            </span>
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-70 animate-pulse"></div>
              <div className="relative bg-black rounded-lg p-2">
                <Edit size={28} className="text-purple-400" />
              </div>
            </div>
            <h1 className="text-4xl font-black">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient">
                Update Problem
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 text-purple-300/80 mt-2">
            <Sparkles size={16} className="text-yellow-400" />
            <span>Problem ID:</span>
            <code className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-purple-300 text-sm">
              {id}
            </code>
          </div>
        </div>

        {/* Debug info (can be collapsed) */}
        {problem && (
          <div className="mb-6 border border-blue-500/30 rounded-lg overflow-hidden animate-slideIn animation-delay-200">
            <div 
              className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-b border-blue-500/30 cursor-pointer"
              onClick={() => toggleSection('debug')}
            >
              <div className="flex items-center gap-2">
                <Info size={16} className="text-blue-400" />
                <h3 className="font-medium text-white">Debug Information</h3>
              </div>
              {expandedSections.debug ? <ChevronUp size={16} className="text-blue-400" /> : <ChevronDown size={16} className="text-blue-400" />}
            </div>
            
            {expandedSections.debug && (
              <div className="p-4 bg-blue-500/5">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300">Found problem:</span>
                    <span className="text-white font-medium">{problem.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300">Difficulty:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      problem.difficulty === 'easy' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                      problem.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                      'bg-red-500/20 text-red-400 border-red-500/50'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300">Tags:</span>
                    <span className="text-gray-300">{Array.isArray(problem.tags) ? problem.tags.join(', ') : problem.tags}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-shake">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
              <span className="text-red-300 flex-1">{error}</span>
              <button
                onClick={() => setError('')}
                className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-all text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl overflow-hidden animate-slideIn animation-delay-400">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="border border-purple-500/30 rounded-lg overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/30 to-purple-800/20 border-b border-purple-500/30 cursor-pointer"
                  onClick={() => toggleSection('basic')}
                >
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-purple-400" />
                    <h2 className="text-lg font-semibold text-white">Basic Information</h2>
                  </div>
                  {expandedSections.basic ? <ChevronUp size={18} className="text-purple-400" /> : <ChevronDown size={18} className="text-purple-400" />}
                </div>
                
                {expandedSections.basic && (
                  <div className="p-6 space-y-6">
                    {/* Title */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-purple-300 font-semibold">Title *</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          className="relative w-full px-4 py-3 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all disabled:opacity-50"
                          required
                          disabled={updating}
                          placeholder="Enter problem title"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-purple-300 font-semibold">Description *</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          className="relative w-full px-4 py-3 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all h-48 disabled:opacity-50"
                          required
                          disabled={updating}
                          placeholder="Enter problem description..."
                        />
                      </div>
                    </div>

                    {/* Difficulty and Tags Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Difficulty */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-purple-300 font-semibold">Difficulty *</span>
                        </label>
                        <select
                          name="difficulty"
                          value={formData.difficulty}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white outline-none focus:border-purple-400 transition-all disabled:opacity-50"
                          disabled={updating}
                        >
                          <option value="easy" className="bg-black">🟢 Easy</option>
                          <option value="medium" className="bg-black">🟡 Medium</option>
                          <option value="hard" className="bg-black">🔴 Hard</option>
                        </select>
                      </div>

                      {/* Tags */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-purple-300 font-semibold flex items-center gap-2">
                            <Tag size={16} />
                            Tags
                          </span>
                          <span className="label-text-alt text-purple-300/60">Comma separated</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                          <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="relative w-full px-4 py-3 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all disabled:opacity-50"
                            disabled={updating}
                            placeholder="e.g., array, string, dp"
                          />
                        </div>
                        <label className="label">
                          <span className="label-text-alt text-purple-300/60 flex items-center gap-1">
                            <Info size={12} />
                            Current tags: {formData.tags || 'none'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-500/30"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs text-purple-300">
                    Update Information
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/update')}
                  className="group relative w-full md:w-auto px-6 py-2.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 hover:text-white hover:border-purple-400 transition-all duration-300 overflow-hidden"
                  disabled={updating}
                  onMouseEnter={() => setHoveredButton('cancel')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                  <span className="relative">Cancel</span>
                </button>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={fetchProblem}
                    className="group relative px-6 py-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 hover:text-white hover:border-blue-400 transition-all duration-300 overflow-hidden"
                    disabled={updating || loading}
                    onMouseEnter={() => setHoveredButton('reload')}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    <span className="relative flex items-center gap-2">
                      <RefreshCw size={16} className={hoveredButton === 'reload' ? 'animate-spin' : ''} />
                      Reload Original
                    </span>
                  </button>

                  <button
                    type="submit"
                    className="group relative px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={updating}
                    onMouseEnter={() => setHoveredButton('submit')}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    <span className="relative flex items-center justify-center gap-2">
                      {updating ? (
                        <>
                          <Loader className="animate-spin" size={18} />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Update Problem
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Additional debug info (optional - can be removed in production) */}
        <div className="mt-8 p-4 bg-purple-500/5 border border-purple-500/30 rounded-lg animate-slideIn animation-delay-600">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-purple-400" />
            <h3 className="font-medium text-purple-300">Technical Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1">
              <p className="text-gray-400">Problem ID:</p>
              <p className="text-purple-300 bg-black/30 p-2 rounded border border-purple-500/30 break-all">{id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">API Endpoint:</p>
              <p className="text-purple-300 bg-black/30 p-2 rounded border border-purple-500/30 break-all">PUT /problem/update/{id}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-gray-400">Current Form Data:</p>
              <pre className="text-purple-300 bg-black/30 p-3 rounded border border-purple-500/30 overflow-x-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
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

export default UpdateProblemForm;

// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router';
// import axiosClient from '../../Utils/axiosClient';

// const UpdateProblemForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     difficulty: 'medium',
//     tags: ''
//   });
//   const [loading, setLoading] = useState(true);
//   const [updating, setUpdating] = useState(false);
//   const [error, setError] = useState('');
//   const [problem, setProblem] = useState(null);

//   useEffect(() => {
//     if (id) {
//       fetchProblem();
//     } else {
//       setError('No problem ID provided');
//       setLoading(false);
//     }
//   }, [id]);

//   // In the fetchProblem function, update it to:
//   const fetchProblem = async () => {
//     try {
//       console.log('Fetching problem with ID:', id);
//       const response = await axiosClient.get(`/problem/problemById/${id}`);
//       console.log('Full API response:', response);
//       console.log('Response data:', response.data);
//       console.log('Type of data:', typeof response.data);
//       console.log('Keys in data:', Object.keys(response.data));

//       // If data is nested inside another property
//       const data = response.data.data || response.data.problem || response.data;
//       console.log('Extracted data:', data);

//       if (!data) {
//         throw new Error('No data returned from server');
//       }

//       setProblem(data);
//       setFormData({
//         title: data.title || '',
//         description: data.description || '',
//         difficulty: data.difficulty || 'medium',
//         tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || '',
//         visibleTestCases: data.visibleTestCases || [],
//         hiddenTestCases: data.hiddenTestCases || [],
//         startCode: data.startCode || [],
//         referenceSolution: data.referenceSolution || []
//       });

//       console.log('Reference solution from API:', data.referenceSolution);
//       console.log('Type of referenceSolution:', typeof data.referenceSolution);

//     } catch (err) {
//       console.error('Error fetching problem:', err);
//       setError(err.response?.data?.message || err.message || 'Failed to fetch problem');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   try {
//     setUpdating(true);
//     setError('');
    
//     console.log('Submitting update for problem ID:', id);
//     console.log('Form tags value:', formData.tags);
    
//     // Convert tags back to string format (matching the original 'array' string)
//     // If tags is a comma-separated string like "array, string", keep it as is
//     // If it's an array, join it back to a string
//     let tagsToSend = formData.tags;
    
//     // If formData.tags is already a string (which it should be), use it directly
//     if (typeof tagsToSend !== 'string') {
//       // If somehow it's an array, join it
//       tagsToSend = Array.isArray(tagsToSend) ? tagsToSend.join(', ') : String(tagsToSend);
//     }
    
//     // Send tags as a STRING, not an array
//     const submitData = {
//       title: formData.title,
//       description: formData.description,
//       difficulty: formData.difficulty,
//       tags: tagsToSend, // Send as string
//       visibleTestCases: problem?.visibleTestCases || [],
//       hiddenTestCases: problem?.hiddenTestCases || [],
//       startCode: problem?.startCode || [],
//       referenceSolution: problem?.referenceSolution || []
//     };
    
//     console.log('Submit data:', submitData);
//     console.log('Tags type:', typeof submitData.tags);
//     console.log('Tags value:', submitData.tags);
    
//     const response = await axiosClient.put(`/problem/update/${id}`, submitData);
//     console.log('Update response:', response);
    
//     alert('Problem updated successfully!');
//     navigate('/admin/update');
    
//   } catch (err) {
//     console.error('Update error:', err);
//     console.error('Error response:', err.response);
//     console.error('Error data:', err.response?.data);
    
//     const errorMessage = err.response?.data?.message || 
//                         err.response?.data?.error || 
//                         err.message || 
//                         'Failed to update problem';
//     setError(errorMessage);
//   } finally {
//     setUpdating(false);
//   }
// };

//   if (loading) {
//     return (
//       <div className="flex flex-col justify-center items-center h-64">
//         <span className="loading loading-spinner loading-lg mb-4"></span>
//         <p>Loading problem details...</p>
//         <p className="text-sm text-gray-500">ID: {id}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4 max-w-4xl">
//       <button
//         onClick={() => navigate('/admin/update')}
//         className="btn btn-ghost mb-4"
//       >
//         ← Back to Problems List
//       </button>

//       <h1 className="text-3xl font-bold mb-2">Update Problem</h1>
//       <p className="text-gray-600 mb-6">Problem ID: {id}</p>

//       {/* Debug info (remove in production) */}
//       {problem && (
//         <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
//           <p className="text-sm text-blue-700">
//             <strong>Debug:</strong> Found problem: {problem.title}
//           </p>
//         </div>
//       )}

//       {error && (
//         <div className="alert alert-error mb-4">
//           <div className="flex-1">
//             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 mx-2 stroke-current">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
//             </svg>
//             <label>{error}</label>
//           </div>
//           <button
//             onClick={() => setError('')}
//             className="btn btn-sm btn-ghost"
//           >
//             Dismiss
//           </button>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-6 bg-base-100 p-6 rounded-lg shadow">
//         <div className="form-control">
//           <label className="label">
//             <span className="label-text font-semibold">Title *</span>
//           </label>
//           <input
//             type="text"
//             name="title"
//             value={formData.title}
//             onChange={handleChange}
//             className="input input-bordered w-full"
//             required
//             disabled={updating}
//           />
//         </div>

//         <div className="form-control">
//           <label className="label">
//             <span className="label-text font-semibold">Description *</span>
//           </label>
//           <textarea
//             name="description"
//             value={formData.description}
//             onChange={handleChange}
//             className="textarea textarea-bordered w-full h-48"
//             required
//             disabled={updating}
//             placeholder="Enter problem description..."
//           />
//         </div>

//         <div className="form-control">
//           <label className="label">
//             <span className="label-text font-semibold">Difficulty *</span>
//           </label>
//           <select
//             name="difficulty"
//             value={formData.difficulty}
//             onChange={handleChange}
//             className="select select-bordered w-full"
//             disabled={updating}
//           >
//             <option value="easy">Easy</option>
//             <option value="medium">Medium</option>
//             <option value="hard">Hard</option>
//           </select>
//         </div>

//         <div className="form-control">
//           <label className="label">
//             <span className="label-text font-semibold">Tags</span>
//             <span className="label-text-alt text-gray-500">Comma separated</span>
//           </label>
//           <input
//             type="text"
//             name="tags"
//             value={formData.tags}
//             onChange={handleChange}
//             className="input input-bordered w-full"
//             disabled={updating}
//             placeholder="e.g., array, string, dynamic-programming"
//           />
//           <label className="label">
//             <span className="label-text-alt text-gray-500">
//               Current tags will appear as: {formData.tags}
//             </span>
//           </label>
//         </div>

//         <div className="divider"></div>

//         <div className="flex justify-between items-center pt-4">
//           <div>
//             <button
//               type="button"
//               onClick={() => navigate('/admin/update')}
//               className="btn btn-outline"
//               disabled={updating}
//             >
//               Cancel
//             </button>
//           </div>

//           <div className="flex gap-3">
//             <button
//               type="button"
//               onClick={fetchProblem}
//               className="btn btn-ghost"
//               disabled={updating || loading}
//             >
//               Reload Original
//             </button>
//             <button
//               type="submit"
//               className="btn btn-primary"
//               disabled={updating}
//             >
//               {updating ? (
//                 <>
//                   <span className="loading loading-spinner loading-sm mr-2"></span>
//                   Updating...
//                 </>
//               ) : 'Update Problem'}
//             </button>
//           </div>
//         </div>
//       </form>

//       {/* Additional debug info */}
//       <div className="mt-8 p-4 bg-gray-100 rounded-lg">
//         <h3 className="font-bold mb-2">Debug Information:</h3>
//         <p className="text-sm">Problem ID from URL: <code>{id}</code></p>
//         <p className="text-sm">Current form data: <code>{JSON.stringify(formData, null, 2)}</code></p>
//         <p className="text-sm">API Endpoint: <code>PUT /problem/update/{id}</code></p>
//       </div>
//     </div>
//   );
// };

// export default UpdateProblemForm;