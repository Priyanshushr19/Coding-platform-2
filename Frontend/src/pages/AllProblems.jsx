import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProblems, 
  fetchSolvedProblems, 
  setFilters 
} from '../slices/problemSlice';
import { 
  Search, Filter, ChevronRight, ChevronLeft,
  TrendingUp, TrendingDown, Clock, Award,
  CheckCircle, XCircle, AlertCircle, RefreshCw,
  BarChart, Target, Users, Star, Sparkles,
  Code, Zap, Shield, Crown, Flame
} from 'lucide-react';

const AllProblemsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { problems, solvedProblems, filters, loading, error } = useSelector((state) => state.problems);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [problemsPerPage] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    if (problems.length === 0) {
      dispatch(fetchProblems());
    }
    
    if (user && solvedProblems.length === 0) {
      dispatch(fetchSolvedProblems(user.id));
    }
  }, [dispatch, user, problems.length, solvedProblems.length]);

  const solvedSet = new Set(solvedProblems.map(p => p._id || p.problemId));

  const filteredAndSortedProblems = problems
    .filter(problem => {
      if (!problem) return false;

      const searchMatch = searchTerm === '' || 
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.tags?.toLowerCase().includes(searchTerm.toLowerCase());

      const difficultyMatch = 
        filters.difficulty === 'all' ||
        problem.difficulty?.toLowerCase() === filters.difficulty.toLowerCase();

      const tagMatch = 
        filters.tag === 'all' ||
        problem.tags?.toLowerCase().includes(filters.tag.toLowerCase());

      const statusMatch =
        filters.status === 'all' ? true :
        filters.status === 'solved' ? solvedSet.has(problem._id) :
        !solvedSet.has(problem._id);

      return searchMatch && difficultyMatch && tagMatch && statusMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'difficulty-asc':
          const diffOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
          return (diffOrder[a.difficulty?.toLowerCase()] || 0) - (diffOrder[b.difficulty?.toLowerCase()] || 0);
        
        case 'difficulty-desc':
          const diffOrderDesc = { 'easy': 3, 'medium': 2, 'hard': 1 };
          return (diffOrderDesc[a.difficulty?.toLowerCase()] || 0) - (diffOrderDesc[b.difficulty?.toLowerCase()] || 0);
        
        case 'title-asc':
          return a.title?.localeCompare(b.title);
        
        case 'title-desc':
          return b.title?.localeCompare(a.title);
        
        case 'acceptance-desc':
          return (b.acceptanceRate || 0) - (a.acceptanceRate || 0);
        
        case 'acceptance-asc':
          return (a.acceptanceRate || 0) - (b.acceptanceRate || 0);
        
        default:
          return 0;
      }
    });

  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = filteredAndSortedProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(filteredAndSortedProblems.length / problemsPerPage);

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    dispatch(setFilters({ difficulty: 'all', tag: 'all', status: 'all' }));
    setSearchTerm('');
    setSortBy('default');
    setCurrentPage(1);
  };

  const getDifficultyBadgeColor = (difficulty) => {
    if (!difficulty) return 'badge-neutral';
    
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getAcceptanceColor = (rate) => {
    if (!rate) return 'text-gray-400';
    if (rate >= 70) return 'text-green-400';
    if (rate >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleRefresh = () => {
    dispatch(fetchProblems());
    if (user) {
      dispatch(fetchSolvedProblems(user.id));
    }
  };

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
        <Code size={100} />
      </div>
      <div className="absolute bottom-40 left-20 text-purple-500/10 animate-float animation-delay-1000">
        <Zap size={80} />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-black/50 border-b border-purple-500/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="animate-slideIn">
              <button 
                onClick={() => navigate('/')}
                className="group btn btn-ghost btn-sm text-purple-300 hover:text-white mb-4 transition-all hover:gap-3"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </button>
              
              <h1 className="text-4xl md:text-5xl font-black mb-2 relative inline-block">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient">
                  Coding Problems
                </span>
                <Sparkles className="absolute -top-6 -right-8 w-6 h-6 text-yellow-400 animate-pulse" />
              </h1>
              
              <p className="text-purple-300/80 text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Practice coding problems to improve your skills
              </p>
            </div>
            
            <div className="flex gap-3 animate-slideIn animation-delay-200">
              <button
                onClick={handleRefresh}
                className="group relative bg-gradient-to-r from-purple-600 to-purple-400 text-white px-4 py-2 rounded-lg font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(128,0,128,0.3)]"
                disabled={loading}
              >
                <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
                <span className="relative flex items-center gap-2">
                  <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group relative border border-purple-500/50 text-purple-300 px-4 py-2 rounded-lg font-medium overflow-hidden transition-all duration-300 hover:border-purple-400 hover:text-white"
              >
                <span className="absolute inset-0 bg-purple-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
                <span className="relative flex items-center gap-2">
                  <Filter size={18} className={showFilters ? 'rotate-180' : ''} />
                  Filters
                </span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Problems', value: problems.length, icon: Code, color: 'purple', delay: 0 },
              { label: 'Solved', value: solvedSet.size, icon: CheckCircle, color: 'green', delay: 100 },
              { label: 'Avg. Acceptance', value: problems.length > 0 ? Math.round(problems.reduce((sum, p) => sum + (p.acceptanceRate || 0), 0) / problems.length) + '%' : '0%', icon: Target, color: 'blue', delay: 200 },
              { label: 'Hard Problems', value: problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length, icon: Flame, color: 'red', delay: 300 }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 hover:border-purple-400 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(128,0,128,0.3)] animate-slideIn"
                  style={{ animationDelay: `${stat.delay}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl"></div>
                  
                  <div className="relative flex items-center gap-3">
                    <div className={`p-2 bg-${stat.color}-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={20} className={`text-${stat.color}-400`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                        {stat.value}
                      </div>
                      <div className={`text-sm text-${stat.color}-300`}>{stat.label}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="mb-6 animate-slideIn animation-delay-400">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  type="text"
                  placeholder="Search problems by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-purple-300/30 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                  >
                    <XCircle size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 mb-6 animate-slideDown">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Filter size={18} className="text-purple-400" />
                  Filter Problems
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="group text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  Reset All
                  <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-3">Status</label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Problems', icon: null },
                      { value: 'solved', label: 'Solved', icon: CheckCircle, color: 'green' },
                      { value: 'unsolved', label: 'Unsolved', icon: XCircle, color: 'red' }
                    ].map((status) => {
                      const Icon = status.icon;
                      return (
                        <button
                          key={status.value}
                          onClick={() => handleFilterChange({ ...filters, status: status.value })}
                          className={`group relative w-full px-3 py-2 rounded-lg text-left transition-all duration-300 overflow-hidden ${
                            filters.status === status.value 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-black/50 border border-purple-500/30 text-purple-300 hover:border-purple-400'
                          }`}
                        >
                          <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
                          <span className="relative flex items-center gap-2">
                            {Icon && <Icon size={16} className={`text-${status.color}-400`} />}
                            {status.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-3">Difficulty</label>
                  <div className="space-y-2">
                    {['all', 'easy', 'medium', 'hard'].map((difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() => handleFilterChange({ ...filters, difficulty })}
                        className={`group relative w-full px-3 py-2 rounded-lg text-left transition-all duration-300 overflow-hidden ${
                          filters.difficulty === difficulty 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-black/50 border border-purple-500/30 text-purple-300 hover:border-purple-400'
                        }`}
                      >
                        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
                        <span className="relative flex items-center gap-2">
                          {difficulty !== 'all' && (
                            <div className={`w-2 h-2 rounded-full ${
                              difficulty === 'easy' ? 'bg-green-400' :
                              difficulty === 'medium' ? 'bg-yellow-400' :
                              'bg-red-400'
                            }`}></div>
                          )}
                          {difficulty === 'all' ? 'All Difficulties' : 
                            difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tag Filter */}
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-3">Tags</label>
                  <select
                    value={filters.tag}
                    onChange={(e) => handleFilterChange({ ...filters, tag: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  >
                    <option value="all">All Tags</option>
                    <option value="array">📚 Array</option>
                    <option value="string">📝 String</option>
                    <option value="linked list">🔗 Linked List</option>
                    <option value="tree">🌳 Tree</option>
                    <option value="graph">🕸️ Graph</option>
                    <option value="dynamic programming">🧮 Dynamic Programming</option>
                    <option value="sorting">🔄 Sorting</option>
                    <option value="searching">🔍 Searching</option>
                    <option value="matrix">📊 Matrix</option>
                    <option value="hash table">⚡ Hash Table</option>
                    <option value="stack">🥞 Stack</option>
                    <option value="queue">🎯 Queue</option>
                    <option value="heap">⛰️ Heap</option>
                    <option value="greedy">💰 Greedy</option>
                    <option value="backtracking">↩️ Backtracking</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-slideIn animation-delay-600">
            <div className="flex items-center gap-2 text-sm text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
              Showing {filteredAndSortedProblems.length} of {problems.length} problems
              {filteredAndSortedProblems.length !== problems.length && (
                <span className="ml-1">
                  ({solvedSet.size} solved)
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-purple-300">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                <option value="default">📋 Default</option>
                <option value="difficulty-asc">📈 Difficulty (Easy → Hard)</option>
                <option value="difficulty-desc">📉 Difficulty (Hard → Easy)</option>
                <option value="title-asc">🔤 Title (A → Z)</option>
                <option value="title-desc">🔤 Title (Z → A)</option>
                <option value="acceptance-desc">✅ Acceptance (High → Low)</option>
                <option value="acceptance-asc">❌ Acceptance (Low → High)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-white animate-shake">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400" />
              <span>{error}</span>
              <button 
                className="ml-auto px-4 py-2 bg-red-500/30 rounded-lg hover:bg-red-500/50 transition-colors"
                onClick={() => dispatch(fetchProblems())}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && problems.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-6 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Code size={32} className="text-purple-400 animate-pulse" />
                </div>
              </div>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold animate-pulse">
                Loading problems...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Problems Table */}
            {currentProblems.length === 0 ? (
              <div className="text-center py-16 bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl animate-scaleIn">
                <Search size={64} className="mx-auto text-purple-400 mb-4 opacity-50" />
                <h3 className="text-2xl font-bold text-white mb-2">No problems found</h3>
                <p className="text-purple-300/80 mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? `No problems match "${searchTerm}". Try a different search term.`
                    : 'No problems match your current filters.'}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="group relative bg-gradient-to-r from-purple-600 to-purple-400 text-white px-6 py-2 rounded-lg font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(128,0,128,0.3)]"
                >
                  <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
                  <span className="relative flex items-center gap-2">
                    <RefreshCw size={18} />
                    Clear All Filters
                  </span>
                </button>
              </div>
            ) : (
              <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl overflow-hidden mb-8 animate-fadeIn">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-gradient-to-r from-purple-900/30 to-purple-800/20 border-b border-purple-500/30">
                  <div className="col-span-1 text-sm font-medium text-purple-300 text-center">#</div>
                  <div className="col-span-5 text-sm font-medium text-purple-300">Problem</div>
                  <div className="col-span-2 text-sm font-medium text-purple-300 text-center">Difficulty</div>
                  <div className="col-span-2 text-sm font-medium text-purple-300 text-center">Acceptance</div>
                  <div className="col-span-2 text-sm font-medium text-purple-300 text-center">Action</div>
                </div>

                {/* Problems List */}
                <div className="divide-y divide-purple-500/10">
                  {currentProblems.map((problem, index) => (
                    <div 
                      key={problem._id} 
                      className="grid grid-cols-12 gap-4 p-4 hover:bg-purple-500/5 transition-all duration-300 group"
                      onMouseEnter={() => setHoveredRow(problem._id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      {/* Problem Number */}
                      <div className="col-span-1 flex items-center justify-center">
                        <span className={`text-gray-400 transition-colors ${hoveredRow === problem._id ? 'text-purple-300' : ''}`}>
                          {indexOfFirstProblem + index + 1}
                        </span>
                      </div>

                      {/* Problem Info */}
                      <div className="col-span-5">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors">
                            <NavLink to={`/problem/${problem._id}`}>
                              {problem.title}
                            </NavLink>
                          </h3>
                          {solvedSet.has(problem._id) && (
                            <div className="relative">
                              <CheckCircle size={16} className="text-green-400" />
                              {hoveredRow === problem._id && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-1 group-hover:text-gray-300 transition-colors">
                          {problem.description}
                        </p>
                        {problem.tags && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {problem.tags.split(',').slice(0, 2).map((tag, tagIndex) => (
                              <span 
                                key={tagIndex} 
                                className="px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded-full text-xs border border-purple-500/30"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                            {problem.tags.split(',').length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-500/10 text-gray-400 rounded-full text-xs border border-gray-500/30">
                                +{problem.tags.split(',').length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Difficulty */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyBadgeColor(problem.difficulty)}`}>
                          {problem.difficulty?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </div>

                      {/* Acceptance Rate */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="text-center">
                          <div className={`font-medium ${getAcceptanceColor(problem.acceptanceRate)}`}>
                            {problem.acceptanceRate ? `${problem.acceptanceRate}%` : 'N/A'}
                          </div>
                          {problem.submissionsCount && (
                            <div className="text-xs text-gray-400">
                              {problem.submissionsCount.toLocaleString()} submissions
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="col-span-2 flex items-center justify-center">
                        <NavLink
                          to={`/problem/${problem._id}`}
                          className="group/btn relative bg-gradient-to-r from-purple-600 to-purple-400 text-white px-4 py-1.5 rounded-lg text-sm font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(128,0,128,0.3)]"
                        >
                          <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></span>
                          <span className="relative flex items-center gap-1">
                            Solve
                            <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                          </span>
                        </NavLink>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between animate-slideIn">
                <div className="text-sm text-purple-300">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="group relative px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-400 hover:text-white transition-all"
                  >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
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
                        className={`px-3 py-2 rounded-lg transition-all ${
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
                    className="group relative px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-400 hover:text-white transition-all"
                  >
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Quick Stats */}
        {!loading && problems.length > 0 && (
          <div className="mt-12 pt-8 border-t border-purple-500/30 animate-slideIn animation-delay-800">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart className="text-purple-400" />
              Problem Statistics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: CheckCircle,
                  label: 'Problems Solved',
                  value: solvedSet.size,
                  total: problems.length,
                  color: 'green',
                  description: `${Math.round((solvedSet.size / problems.length) * 100)}% of total`
                },
                {
                  icon: Shield,
                  label: 'Easy Problems',
                  value: problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length,
                  color: 'blue',
                  description: 'Great for beginners'
                },
                {
                  icon: Target,
                  label: 'Medium Problems',
                  value: problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length,
                  color: 'yellow',
                  description: 'Common in interviews'
                },
                {
                  icon: Flame,
                  label: 'Hard Problems',
                  value: problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length,
                  color: 'red',
                  description: 'Challenge yourself'
                }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="group relative bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 hover:border-purple-400 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(128,0,128,0.3)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl"></div>
                    
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 bg-${stat.color}-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon size={24} className={`text-${stat.color}-400`} />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                            {stat.value}
                          </div>
                          <div className={`text-sm text-${stat.color}-300`}>{stat.label}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {stat.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
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
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        
        .bg-300\% {
          background-size: 300%;
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

export default AllProblemsPage;