import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, updateProfilePicture } from '../slices/authSlice';
import axiosClient from '../Utils/axiosClient';
import { 
  fetchProblems, 
  fetchSolvedProblems, 
  setFilters 
} from '../slices/problemSlice';
import { 
  Trophy, 
  Clock, 
  Calendar,
  Users,
  Award,
  ChevronRight,
  Home,
  Folder,
  BarChart,
  Users as UsersIcon,
  Sparkles,
  Zap,
  TrendingUp,
  Star,
  Code,
  Crown,
  Flame
} from 'lucide-react';
import logo from '../assets/logo2.png';

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { problems, solvedProblems, filters, loading, error } = useSelector((state) => state.problems);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [contests, setContests] = useState([]);
  const [contestLoading, setContestLoading] = useState(false);
  const [showContestDropdown, setShowContestDropdown] = useState(false);
  const [ongoingContests, setOngoingContests] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const popupTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }

    try {
      const result = await dispatch(updateProfilePicture(formData)).unwrap();
      
      setPopupMessage("✅ Profile picture updated successfully!");
      setPopupType("success");
      setShowPopup(true);
      popupTimeoutRef.current = setTimeout(() => {
        setShowPopup(false);
        popupTimeoutRef.current = null;
      }, 3000);

    } catch (err) {
      setPopupMessage("❌ Failed to update profile picture");
      setPopupType("error");
      setShowPopup(true);
      
      popupTimeoutRef.current = setTimeout(() => {
        setShowPopup(false);
        popupTimeoutRef.current = null;
      }, 3000);
    }
  };

  const calculateTimeRemaining = (endTime) => {
    if (!endTime) return 'Ended';
    
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  useEffect(() => {
    if (problems.length === 0) {
      dispatch(fetchProblems());
    }
    
    if (user && solvedProblems.length === 0) {
      dispatch(fetchSolvedProblems(user.id));
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    fetchContests(abortControllerRef.current.signal);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, user?.id]);

  const formatDate = (dateString) => {
  try {
    if (!dateString) return 'Invalid date';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return 'Invalid date';
  }
};

  const fetchContests = useCallback(async (signal) => {
    setContestLoading(true);
    try {
      const { data } = await axiosClient.get('/api/contests?status=ongoing&limit=3', { signal });
      
      if (data.success) {
        setContests(data.contests || []);
        setOngoingContests(data.contests?.filter(c => c.status === 'ongoing') || []);
      }
    } catch (error) {
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
        console.error('Error fetching contests:', error);
      }
    } finally {
      if (!signal?.aborted) {
        setContestLoading(false);
      }
    }
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const solvedSet = useMemo(() =>
    new Set(solvedProblems.map(p => p._id || p.problemId)),
    [solvedProblems]
  );

  const filteredProblems = problems.filter(problem => {
  if (!problem || !problem.title) return false;

  const difficultyMatch =
    filters.difficulty === 'all' ||
    (problem.difficulty && problem.difficulty.toLowerCase() === filters.difficulty.toLowerCase());

  const tagMatch =
    filters.tag === 'all' ||
    (problem.tags && problem.tags.toLowerCase() === filters.tag.toLowerCase());

  const statusMatch =
    filters.status === 'all' ? true :
      filters.status === 'solved' ? solvedSet.has(problem._id) :
        !solvedSet.has(problem._id);

  return difficultyMatch && tagMatch && statusMatch;
});

const getProfilePictureUrl = () => {
  if (user?.profilePic) {
    const profilePic = user.profilePic;
    if (profilePic.startsWith("http") || profilePic.startsWith("data:")) {
      return profilePic;
    }
    return `http://localhost:5005/${profilePic}`;
  }
  
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser.profilePic) {
      const storedPic = storedUser.profilePic;
      if (storedPic.startsWith("http") || storedPic.startsWith("data:")) {
        return storedPic;
      }
      return `http://localhost:5005/${storedPic}`;
    }
  } catch (error) {
    console.error('Error reading localStorage:', error);
  }
  
  return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
};

useEffect(() => {
  if (user) {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.profilePic && (!user.profilePic || user.profilePic !== storedUser.profilePic)) {
        console.log('Syncing profile picture in Homepage...');
        dispatch(updateProfilePic(storedUser.profilePic));
      }
    } catch (error) {
      console.error('Error syncing profile picture:', error);
    }
  }
}, [user, dispatch]);

  if (loading && problems.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-black opacity-50"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, purple 1px, transparent 0)',
          backgroundSize: '50px 50px',
          opacity: 0.15
        }}></div>
        
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-6 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Code size={32} className="text-purple-400 animate-pulse" />
            </div>
          </div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-xl font-bold animate-pulse">
            Loading your coding journey...
          </p>
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
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full filter blur-[128px] animate-pulse animation-delay-2000"></div>
      
      {/* Popup Toast */}
      {showPopup && (
        <div className="toast toast-top toast-end z-50 animate-slideIn">
          <div className={`alert ${popupType === "success" ? "alert-success" : "alert-error"} shadow-lg bg-black/90 border-2 ${popupType === "success" ? "border-purple-500" : "border-red-500"} backdrop-blur-md`}>
            <span className="text-white">{popupMessage}</span>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar bg-black/80 backdrop-blur-md text-white px-6 py-4 border-b border-purple-500/30 sticky top-0 z-40">
        <div className="flex-1 flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-purple-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <img
              src={logo}
              alt="logo"
              className="relative w-10 h-10 rounded-lg transform group-hover:scale-110 transition-transform"
            />
          </div>
          <NavLink
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 transition-all"
          >
            CodeVerse
          </NavLink>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 flex justify-center gap-2">
          {[
            { to: "/", icon: Home, label: "Home" },
            { to: "/problems", icon: Folder, label: "Problems" },
            { to: "/contests", icon: Trophy, label: "Contests", hasLive: ongoingContests.length > 0 },
            ...(user?.role === 'admin' ? [{ to: "/admin", icon: UsersIcon, label: "Admin" }] : [])
          ].map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              className={({ isActive }) => 
                `relative group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-purple-300/70 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg opacity-20 animate-pulse"></span>
                  )}
                  <span className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 rounded-lg transition-colors"></span>
                  <item.icon size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
                  <span className="relative z-10">{item.label}</span>
                  {item.hasLive && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Profile Section */}
        <div className="flex-none gap-4 items-center">
          {/* Ongoing Contest Badge */}
          {ongoingContests.length > 0 && ongoingContests[0] && (
            <div 
              className="relative group flex items-center gap-2 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/50 rounded-lg px-3 py-1.5 cursor-pointer hover:border-purple-400 transition-all duration-300 hover:scale-105 mr-3 overflow-hidden"
              onClick={() => navigate(`/contests/${ongoingContests[0]._id}`)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center gap-2">
                <div className="relative">
                  <Trophy size={16} className="text-yellow-400 animate-bounce" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </div>
                <div>
                  <p className="font-medium text-xs text-white truncate max-w-[120px]">
                    {ongoingContests[0].title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-purple-300">
                    <Clock size={10} />
                    <span>{calculateTimeRemaining(ongoingContests[0].endTime)} left</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Image */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="cursor-pointer group">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <img
                  src={getProfilePictureUrl()}
                  className="relative w-10 h-10 rounded-full border-2 border-purple-500 object-cover transform group-hover:scale-110 transition-all duration-300"
                  alt="profile"
                />
              </div>
            </label>
            
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-black/90 backdrop-blur-md rounded-box w-52 border border-purple-500/30 mt-2 animate-fadeIn">
              <li>
                <div className="flex items-center gap-3 p-2">
                  <div className="relative">
                    <img
                      src={getProfilePictureUrl()}
                      className="w-12 h-12 rounded-full border-2 border-purple-500"
                      alt="profile"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-purple-300">@{user?.username}</p>
                  </div>
                </div>
              </li>
              <li className="divider my-1 bg-purple-500/30"></li>
              <li>
                <NavLink to="/profile" className="text-white hover:bg-purple-600/50 hover:text-white transition-colors">
                  <Sparkles size={16} className="mr-2" />
                  Profile
                </NavLink>
              </li>
              <li>
                <label htmlFor="profileUpload" className="cursor-pointer text-white hover:bg-purple-600/50 hover:text-white transition-colors">
                  <Zap size={16} className="mr-2" />
                  Change Picture
                </label>
              </li>
              <li>
                <NavLink to="/my-contests" className="text-white hover:bg-purple-600/50 hover:text-white transition-colors">
                  <Trophy size={16} className="mr-2" />
                  My Contests
                </NavLink>
              </li>
              <li className="divider my-1 bg-purple-500/30"></li>
              <li>
                <button onClick={handleLogout} className="text-white hover:bg-red-600/50 hover:text-white transition-colors w-full text-left">
                  Logout
                </button>
              </li>
            </ul>
          </div>

          <input
            type="file"
            id="profileUpload"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-6 relative z-10">
        {/* Hero Section */}
        <div className="mb-16 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Code size={300} className="text-purple-500" />
          </div>
          
          <h1 className="text-6xl font-bold text-center text-white mb-6 animate-fadeIn relative">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient">
              CodeVerse
            </span>
          </h1>
          <p className="text-xl text-center text-purple-300/80 mb-12 max-w-3xl mx-auto animate-fadeIn animation-delay-200">
            Master coding skills with interactive challenges, compete in contests, and track your progress.
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Folder, label: "Coding Problems", value: problems.length, color: "purple", delay: 0 },
              { icon: Trophy, label: "Active Contests", value: ongoingContests.length, color: "yellow", delay: 200, extra: ongoingContests.length > 0 ? "Join now!" : null },
              { icon: Award, label: "Problems Solved", value: solvedSet.size, color: "green", delay: 400 }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="group relative bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-400 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(128,0,128,0.3)] animate-slideIn"
                style={{ animationDelay: `${stat.delay}ms` }}
                onClick={stat.icon === Trophy ? () => navigate('/contests') : undefined}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative flex items-center gap-4">
                  <div className={`p-3 bg-${stat.color}-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon size={24} className={`text-${stat.color}-400`} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
                      {stat.value}
                    </p>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{stat.label}</p>
                    {stat.extra && (
                      <p className="text-sm text-green-400 mt-1 animate-pulse">{stat.extra}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Ongoing Contests Section */}
          {ongoingContests.length > 0 && (
            <div className="mb-16 animate-fadeIn animation-delay-600">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <div className="relative">
                    <Trophy className="text-yellow-500" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  </div>
                  Live Contests
                  <span className="badge badge-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 animate-pulse">
                    JOIN NOW
                  </span>
                </h2>
                <NavLink 
                  to="/contests" 
                  className="group text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-all hover:gap-2"
                >
                  View all <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </NavLink>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoingContests.map((contest, idx) => (
                  <div
                    key={contest._id}
                    className="group relative bg-gradient-to-br from-purple-900/30 via-black to-blue-900/30 border border-purple-500/50 rounded-xl p-6 hover:border-purple-400 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(128,0,128,0.2)] cursor-pointer overflow-hidden animate-slideIn"
                    style={{ animationDelay: `${800 + idx * 200}ms` }}
                    onClick={() => navigate(`/contests/${contest._id}`)}
                    onMouseEnter={() => setHoveredCard(contest._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Animated border gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="badge bg-gradient-to-r from-green-500 to-green-600 text-white border-0 animate-pulse">
                            ● LIVE
                          </span>
                          <span className={`badge ${
                            contest.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                            contest.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          } border-0`}>
                            {contest.difficulty || 'Medium'}
                          </span>
                        </div>
                        <div className="relative">
                          <Trophy size={24} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                          {hoveredCard === contest._id && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-1 group-hover:text-purple-300 transition-colors">
                        {contest.title}
                      </h3>
                      <p className="text-gray-300/80 text-sm mb-4 line-clamp-2 group-hover:text-gray-300 transition-colors">
                        {contest.description}
                      </p>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={16} className="text-red-400 animate-pulse" />
                          <span className="text-gray-400">Ends:</span>
                          <span className="text-white font-medium">{formatDate(contest.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users size={16} className="text-blue-400" />
                          <span className="text-gray-400">Participants:</span>
                          <span className="text-white font-medium">{contest.participants?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Award size={16} className="text-yellow-400" />
                          <span className="text-gray-400">Prize:</span>
                          <span className="text-white font-medium">{contest.prizePool || 'Certificate'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full">
                          {calculateTimeRemaining(contest.endTime)} remaining
                        </div>
                        <button className="relative group/btn btn btn-sm bg-gradient-to-r from-purple-600 to-purple-400 border-0 text-white hover:from-purple-500 hover:to-purple-300 transition-all duration-300 overflow-hidden">
                          <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></span>
                          <span className="relative">Enter Contest</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Problems Section */}
        <div className="animate-fadeIn animation-delay-1000">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Code className="text-purple-400" />
              Coding Challenges
              <span className="badge bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                {filteredProblems.length} available
              </span>
            </h2>
            <NavLink 
              to="/problems" 
              className="group text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-all hover:gap-2"
            >
              Explore all <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </NavLink>
          </div>

          {/* Error Display */}
          {error && (
            <div className="alert alert-error mb-6 bg-red-500/20 border border-red-500 text-white backdrop-blur-sm animate-shake">
              <span>{error}</span>
              <button 
                className="btn btn-sm bg-red-600 border-0 text-white hover:bg-red-700"
                onClick={() => dispatch(fetchProblems())}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <select
              className="select bg-black/60 backdrop-blur-sm text-white border-purple-500/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
              value={filters.status}
              onChange={(e) => handleFilterChange({ ...filters, status: e.target.value })}
            >
              <option value="all">📋 All Problems</option>
              <option value="solved">✅ Solved</option>
              <option value="unsolved">🔄 Unsolved</option>
            </select>

            <select
              className="select bg-black/60 backdrop-blur-sm text-white border-purple-500/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange({ ...filters, difficulty: e.target.value })}
            >
              <option value="all">📊 All Difficulties</option>
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>

            <select
              className="select bg-black/60 backdrop-blur-sm text-white border-purple-500/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
              value={filters.tag}
              onChange={(e) => handleFilterChange({ ...filters, tag: e.target.value })}
            >
              <option value="all">🏷️ All Tags</option>
              <option value="array">📚 Array</option>
              <option value="linked list">🔗 Linked List</option>
              <option value="graph">🕸️ Graph</option>
              <option value="dp">🧮 DP</option>
              <option value="string">📝 String</option>
              <option value="tree">🌳 Tree</option>
            </select>

            {/* Refresh Button */}
            <button
              className="relative group btn bg-gradient-to-r from-purple-600 to-purple-400 border-0 text-white hover:from-purple-500 hover:to-purple-300 transition-all duration-300 overflow-hidden"
              onClick={() => {
                dispatch(fetchProblems());
                if (user) {
                  dispatch(fetchSolvedProblems(user.id));
                }
                fetchContests();
              }}
              disabled={loading}
            >
              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Refresh
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Problems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProblems.slice(0, 9).map((problem, idx) => {
              if (!problem) return null;
              
              return (
                <div
                  key={problem._id}
                  className="group relative bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-400 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(128,0,128,0.2)] animate-slideIn"
                  style={{ animationDelay: `${1200 + idx * 100}ms` }}
                >
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl"></div>
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                        <NavLink
                          to={`/problem/${problem._id}`}
                          className="hover:text-purple-300 transition-colors"
                        >
                          {problem.title || 'Untitled Problem'}
                        </NavLink>
                      </h3>
                      
                      <div className="flex flex-col gap-1 items-end">
                        {solvedSet.has(problem._id) && (
                          <div className="badge bg-gradient-to-r from-green-500 to-green-400 text-white border-0 gap-1">
                            <span className="text-lg leading-none">✓</span>
                            Solved
                          </div>
                        )}
                        <div className={`badge ${
                          problem.difficulty?.toLowerCase() === 'easy' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                          problem.difficulty?.toLowerCase() === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                          'bg-red-500/20 text-red-400 border-red-500/50'
                        }`}>
                          {problem.difficulty?.toUpperCase() || 'MEDIUM'}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-300/80 text-sm mb-4 line-clamp-2 group-hover:text-gray-300 transition-colors">
                      {problem.description || 'No description available'}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="badge badge-outline text-purple-300 border-purple-500/50 group-hover:border-purple-400 transition-colors">
                        {problem.tags || 'General'}
                      </div>
                      <NavLink
                        to={`/problem/${problem._id}`}
                        className="relative group/btn btn btn-sm bg-gradient-to-r from-purple-600 to-purple-400 border-0 text-white hover:from-purple-500 hover:to-purple-300 transition-all duration-300 overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></span>
                        <span className="relative flex items-center gap-1">
                          Solve <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                      </NavLink>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Problems Count */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-3">
              <span className="text-purple-300">
                Showing {Math.min(filteredProblems.length, 9)} of {problems.length} problems
              </span>
              {loading && (
                <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              )}
            </div>
            
            <div className="mt-6">
              <NavLink 
                to="/problems" 
                className="relative group inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-400 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-500 hover:to-purple-300 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
                <span className="relative flex items-center gap-2">
                  <Code size={20} />
                  View All Problems
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 300% 300%;
          animation: gradient 6s ease infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
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
        
        .animate-slideIn {
          animation: slideIn 0.6s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
        
        .bg-300\% {
          background-size: 300%;
        }
      `}</style>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  if (!difficulty) return 'badge-neutral';
  
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default Homepage;

// import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
// import { NavLink, useNavigate } from 'react-router';
// import { useDispatch, useSelector } from 'react-redux';
// import { logoutUser, updateProfilePicture } from '../slices/authSlice';
// import axiosClient from '../Utils/axiosClient';
// import { 
//   fetchProblems, 
//   fetchSolvedProblems, 
//   setFilters 
// } from '../slices/problemSlice';
// import { 
//   Trophy, 
//   Clock, 
//   Calendar,
//   Users,
//   Award,
//   ChevronRight,
//   Home,
//   Folder,
//   BarChart,
//   Users as UsersIcon
// } from 'lucide-react';
// import logo from '../assets/logo2.png';

// function Homepage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
//   const { problems, solvedProblems, filters, loading, error } = useSelector((state) => state.problems);

//   const [showPopup, setShowPopup] = useState(false);
//   const [popupMessage, setPopupMessage] = useState("");
//   const [popupType, setPopupType] = useState("success");
//   const [contests, setContests] = useState([]);
//   const [contestLoading, setContestLoading] = useState(false);
//   const [showContestDropdown, setShowContestDropdown] = useState(false);
//   const [ongoingContests, setOngoingContests] = useState([]);
//   const popupTimeoutRef = useRef(null);
//   const abortControllerRef = useRef(null);

//   const handleImageSelect = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("profilePic", file);

//     // Clear existing timeout
//     if (popupTimeoutRef.current) {
//       clearTimeout(popupTimeoutRef.current);
//     }

//     try {
//       const result = await dispatch(updateProfilePicture(formData)).unwrap();
      
//       setPopupMessage("✅ Profile picture updated successfully!");
//       setPopupType("success");
//       setShowPopup(true);
//       popupTimeoutRef.current = setTimeout(() => {
//         setShowPopup(false);
//         popupTimeoutRef.current = null;
//       }, 3000);

//     } catch (err) {
//       setPopupMessage("❌ Failed to update profile picture");
//       setPopupType("error");
//       setShowPopup(true);
      
//       popupTimeoutRef.current = setTimeout(() => {
//         setShowPopup(false);
//         popupTimeoutRef.current = null;
//       }, 3000);
//     }
//   };

//   // Add this function near the top of your Homepage component, after the other helper functions
//   const calculateTimeRemaining = (endTime) => {
//     if (!endTime) return 'Ended';
    
//     const end = new Date(endTime);
//     const now = new Date();
//     const diff = end - now;
    
//     if (diff <= 0) return 'Ended';
    
//     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//     const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
//     if (days > 0) return `${days}d ${hours}h`;
//     if (hours > 0) return `${hours}h ${minutes}m`;
//     return `${minutes}m`;
//   };

//   useEffect(() => {
//     // Fetch problems only if not already loaded
//     if (problems.length === 0) {
//       dispatch(fetchProblems());
//     }
    
//     // Fetch solved problems only if user exists and not already loaded
//     if (user && solvedProblems.length === 0) {
//       dispatch(fetchSolvedProblems(user.id));
//     }

//     // Abort previous request if component unmounts
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }
//     abortControllerRef.current = new AbortController();

//     // Fetch contests
//     fetchContests(abortControllerRef.current.signal);

//     // Cleanup function
//     return () => {
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//       if (popupTimeoutRef.current) {
//         clearTimeout(popupTimeoutRef.current);
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [dispatch, user?.id]);

//   const formatDate = (dateString) => {
//   try {
//     if (!dateString) return 'Invalid date';
    
//     const date = new Date(dateString);
    
//     // Check if date is valid
//     if (isNaN(date.getTime())) return 'Invalid date';
    
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   } catch (error) {
//     console.error('Error formatting date:', error, dateString);
//     return 'Invalid date';
//   }
// };


//   const fetchContests = useCallback(async (signal) => {
//     setContestLoading(true);
//     try {
//       const { data } = await axiosClient.get('/api/contests?status=ongoing&limit=3', { signal });
      
//       if (data.success) {
//         setContests(data.contests || []);
//         // Filter for ongoing contests only
//         setOngoingContests(data.contests?.filter(c => c.status === 'ongoing') || []);
//       }
//     } catch (error) {
//       if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
//         console.error('Error fetching contests:', error);
//       }
//     } finally {
//       if (!signal?.aborted) {
//         setContestLoading(false);
//       }
//     }
//   }, []);

//   const handleLogout = () => {
//     dispatch(logoutUser());
//   };

//   const handleFilterChange = (newFilters) => {
//     dispatch(setFilters(newFilters));
//   };

//   // Optimized lookup for solved problems
//   const solvedSet = useMemo(() =>
//     new Set(solvedProblems.map(p => p._id || p.problemId)),
//     [solvedProblems]
//   );

//   const filteredProblems = problems.filter(problem => {
//   if (!problem || !problem.title) return false;

//   const difficultyMatch =
//     filters.difficulty === 'all' ||
//     (problem.difficulty && problem.difficulty.toLowerCase() === filters.difficulty.toLowerCase());

//   const tagMatch =
//     filters.tag === 'all' ||
//     (problem.tags && problem.tags.toLowerCase() === filters.tag.toLowerCase());

//   const statusMatch =
//     filters.status === 'all' ? true :
//       filters.status === 'solved' ? solvedSet.has(problem._id) :
//         !solvedSet.has(problem._id);

//   return difficultyMatch && tagMatch && statusMatch;
// });

//   // In your Homepage.jsx, update the getProfilePictureUrl function
// const getProfilePictureUrl = () => {
//   // First check if we have a profilePic in Redux state
//   if (user?.profilePic) {
//     const profilePic = user.profilePic;
//     if (profilePic.startsWith("http") || profilePic.startsWith("data:")) {
//       return profilePic;
//     }
//     return `http://localhost:5005/${profilePic}`;
//   }
  
//   // Fallback to localStorage (in case Redux hasn't synced yet)
//   try {
//     const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
//     if (storedUser.profilePic) {
//       const storedPic = storedUser.profilePic;
//       if (storedPic.startsWith("http") || storedPic.startsWith("data:")) {
//         return storedPic;
//       }
//       return `http://localhost:5005/${storedPic}`;
//     }
//   } catch (error) {
//     console.error('Error reading localStorage:', error);
//   }
  
//   // Default fallback
//   return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
// };

// // Also, add a useEffect to sync profile picture on mount
// useEffect(() => {
//   // Sync profile picture from localStorage to Redux on component mount
//   if (user) {
//     try {
//       const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
//       if (storedUser.profilePic && (!user.profilePic || user.profilePic !== storedUser.profilePic)) {
//         console.log('Syncing profile picture in Homepage...');
//         dispatch(updateProfilePic(storedUser.profilePic));
//       }
//     } catch (error) {
//       console.error('Error syncing profile picture:', error);
//     }
//   }
// }, [user, dispatch]);

//   if (loading && problems.length === 0) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
//         <div className="text-center">
//           <div className="loading loading-spinner loading-lg text-purple-400"></div>
//           <p className="text-white mt-4">Loading problems...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black">
//       {/* Popup Toast */}
//       {showPopup && (
//         <div className="toast toast-top toast-end z-50">
//           <div className={`alert ${popupType === "success" ? "alert-success" : "alert-error"} shadow-lg`}>
//             <span>{popupMessage}</span>
//           </div>
//         </div>
//       )}

//       {/* Navbar */}
//       <nav className="navbar bg-black/80 text-white px-6 py-4 border-b border-purple-500 sticky top-0 z-40">
//         <div className="flex-1 flex items-center gap-4">
//           <img
//             src={logo}
//             alt="logo"
//             className="w-10 h-10 rounded-lg"
//           />
//           <NavLink
//             to="/"
//             className="text-2xl font-bold text-purple-400 hover:text-purple-300 transition-colors"
//           >
//             CodeVerse
//           </NavLink>
//         </div>

//         {/* Navigation Links */}
//         <div className="flex-1 flex justify-center gap-6">
//           <NavLink
//             to="/"
//             className={({ isActive }) => 
//               `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                 isActive 
//                   ? 'bg-purple-600 text-white' 
//                   : 'text-purple-300 hover:bg-purple-600/50'
//               }`
//             }
//           >
//             <Home size={20} />
//             Home
//           </NavLink>
          
//           <NavLink
//             to="/problems"
//             className={({ isActive }) => 
//               `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                 isActive 
//                   ? 'bg-purple-600 text-white' 
//                   : 'text-purple-300 hover:bg-purple-600/50'
//               }`
//             }
//           >
//             <Folder size={20} />
//             Problems
//           </NavLink>
          
//           {/* Contests Dropdown */}
//           <div className="relative" 
//                onMouseEnter={() => setShowContestDropdown(true)}
//                onMouseLeave={() => setShowContestDropdown(false)}>
//             <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-purple-300 hover:bg-purple-600/60 transition-colors">
//               <Trophy size={20} />
//               Contests
//               {ongoingContests.length > 0 && (
//                 <span className="badge badge-xs bg-red-500 border-0 text-white animate-pulse">
//                   {ongoingContests.length}
//                 </span>
//               )}
//             </button>
            
//             {showContestDropdown && (
//               <div className="absolute top-full left-0  w-80 bg-black border border-purple-500 rounded-lg shadow-lg z-50">
//                 <div className="p-4">
//                   <div className="flex items-center justify-between mb-3">
//                     <h3 className="font-bold text-white">Live Contests</h3>
//                     <NavLink 
//                       to="/contests" 
//                       className="text-sm text-purple-400 hover:text-purple-300"
//                       onClick={() => setShowContestDropdown(false)}
//                     >
//                       View all
//                     </NavLink>
//                   </div>
                  
//                   {contestLoading ? (
//                     <div className="flex justify-center py-4">
//                       <div className="loading loading-spinner loading-sm text-purple-400"></div>
//                     </div>
//                   ) : ongoingContests.length > 0 ? (
//                     <div className="space-y-3">
//                       {ongoingContests.slice(0, 2).map(contest => (
//                         <div 
//                           key={contest._id}
//                           className="p-3 bg-purple-900/30 border border-purple-500/50 rounded-lg cursor-pointer hover:bg-purple-900/50 transition-colors"
//                           onClick={() => {
//                             navigate(`/contests/${contest._id}`);
//                             setShowContestDropdown(false);
//                           }}
//                         >
//                           <div className="flex items-center justify-between mb-2">
//                             <h4 className="font-medium text-white text-sm truncate">{contest.title}</h4>
//                             <span className="badge badge-xs bg-green-500/20 text-green-400 border-green-500">
//                               LIVE
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2 text-xs text-purple-300">
//                             <Clock size={12} />
//                             <span>{calculateTimeRemaining(contest.endTime)} left</span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="text-center py-4 text-gray-400 text-sm">
//                       No active contests
//                     </div>
//                   )}
                  
//                   <div className="border-t border-purple-500/30 mt-4 pt-4">
//                     <button 
//                       onClick={() => {
//                         navigate('/contests');
//                         setShowContestDropdown(false);
//                       }}
//                       className="btn btn-sm bg-purple-600 border-purple-600 text-white hover:bg-purple-700 w-full"
//                     >
//                       <Trophy size={16} className="mr-2" />
//                       Browse All Contests
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
          
//           <NavLink
//             to="/leaderboard"
//             className={({ isActive }) => 
//               `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                 isActive 
//                   ? 'bg-purple-600 text-white' 
//                   : 'text-purple-300 hover:bg-purple-600/50'
//               }`
//             }
//           >
//             <BarChart size={20} />
//             Leaderboard
//           </NavLink>
          
//           {user?.role === 'admin' && (
//             <NavLink
//               to="/admin"
//               className={({ isActive }) => 
//                 `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                   isActive 
//                     ? 'bg-purple-600 text-white' 
//                     : 'text-purple-300 hover:bg-purple-600/50'
//                 }`
//               }
//             >
//               <UsersIcon size={20} />
//               Admin
//             </NavLink>
//           )}
//         </div>

//         {/* Profile Section */}
//         <div className="flex-none gap-4 items-center">
//           {/* Ongoing Contest Badge (if any) */}
//           {ongoingContests.length > 0 && ongoingContests[0] && (
//             <div 
//               className="flex items-center gap-2 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/50 rounded-lg px-3 py-1.5 cursor-pointer hover:border-purple-400 transition-colors mr-3"
//               onClick={() => navigate(`/contests/${ongoingContests[0]._id}`)}
//             >
//               <Trophy size={16} className="text-yellow-400" />
//               <div>
//                 <p className="font-medium text-xs text-white truncate max-w-[120px]">
//                   {ongoingContests[0].title}
//                 </p>
//                 <div className="flex items-center gap-1 text-xs text-gray-300">
//                   <Clock size={10} />
//                   <span>{calculateTimeRemaining(ongoingContests[0].endTime)} left</span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Profile Image */}
//           <div className="dropdown dropdown-end">
//             <label tabIndex={0} className="cursor-pointer">
//               <img
//                 src={getProfilePictureUrl()}
//                 className="w-10 h-10 rounded-full border-2 border-purple-500 object-cover hover:border-purple-300 transition-colors"
//                 alt="profile"
//               />
//             </label>
            
//             <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-black rounded-box w-52 border border-purple-500 mt-2">
//               <li>
//                 <div className="flex items-center gap-3 p-2">
//                   <img
//                     src={getProfilePictureUrl()}
//                     className="w-12 h-12 rounded-full border-2 border-purple-500"
//                     alt="profile"
//                   />
//                   <div>
//                     <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
//                     <p className="text-sm text-purple-300">{user?.username}</p>
//                   </div>
//                 </div>
//               </li>
//               <li className="divider my-1"></li>
//               <li>
//                 <NavLink to="/profile" className="text-white hover:bg-purple-600">Profile</NavLink>
//               </li>
//               <li>
//                 <label htmlFor="profileUpload" className="cursor-pointer text-white hover:bg-purple-600">
//                   Change Profile Picture
//                 </label>
//               </li>
//               <li>
//                 <NavLink to="/my-contests" className="text-white hover:bg-purple-600">
//                   <Trophy size={16} className="mr-2" />
//                   My Contests
//                 </NavLink>
//               </li>
//               <li className="divider my-1"></li>
//               <li>
//                 <button onClick={handleLogout} className="text-white hover:bg-red-600">
//                   Logout
//                 </button>
//               </li>
//             </ul>
//           </div>

//           <input
//             type="file"
//             id="profileUpload"
//             accept="image/*"
//             onChange={handleImageSelect}
//             className="hidden"
//           />
//         </div>
//       </nav>

//       {/* Main Content */}
//       <div className="container mx-auto p-6">
//         {/* Hero Section with Contests */}
//         <div className="mb-12">
//           <h1 className="text-5xl font-bold text-center text-white mb-6">
//             Welcome to <span className="text-purple-400">CodeVerse</span>
//           </h1>
//           <p className="text-xl text-center text-purple-300 mb-10 max-w-3xl mx-auto">
//             Master coding skills with interactive challenges, compete in contests, and track your progress.
//           </p>
          
//           {/* Stats & Quick Actions */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//             {/* Problems Stat */}
//             <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6">
//               <div className="flex items-center gap-4">
//                 <div className="p-3 bg-purple-500/20 rounded-lg">
//                   <Folder size={24} className="text-purple-400" />
//                 </div>
//                 <div>
//                   <p className="text-3xl font-bold text-white">{problems.length}</p>
//                   <p className="text-gray-400">Coding Problems</p>
//                 </div>
//               </div>
//             </div>
            
//             {/* Contests Stat */}
//             <div 
//               className="bg-black/50 border border-purple-500/30 rounded-xl p-6 cursor-pointer hover:border-purple-400 transition-colors"
//               onClick={() => navigate('/contests')}
//             >
//               <div className="flex items-center gap-4">
//                 <div className="p-3 bg-yellow-500/20 rounded-lg">
//                   <Trophy size={24} className="text-yellow-400" />
//                 </div>
//                 <div>
//                   <p className="text-3xl font-bold text-white">{ongoingContests.length}</p>
//                   <p className="text-gray-400">Active Contests</p>
//                   {ongoingContests.length > 0 && (
//                     <p className="text-sm text-green-400 mt-1">Join now!</p>
//                   )}
//                 </div>
//               </div>
//             </div>
            
//             {/* Solved Problems */}
//             <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6">
//               <div className="flex items-center gap-4">
//                 <div className="p-3 bg-green-500/20 rounded-lg">
//                   <Award size={24} className="text-green-400" />
//                 </div>
//                 <div>
//                   <p className="text-3xl font-bold text-white">{solvedSet.size}</p>
//                   <p className="text-gray-400">Problems Solved</p>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Ongoing Contests Section */}
//           {ongoingContests.length > 0 && (
//             <div className="mb-12">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl font-bold text-white flex items-center gap-2">
//                   <Trophy className="text-yellow-500" />
//                   Ongoing Contests
//                   <span className="badge badge-sm bg-green-500/20 text-green-400 border-green-500 animate-pulse">
//                     LIVE
//                   </span>
//                 </h2>
//                 <NavLink 
//                   to="/contests" 
//                   className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
//                 >
//                   View all <ChevronRight size={18} />
//                 </NavLink>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {ongoingContests.map(contest => (
//                   <div 
//                     key={contest._id} 
//                     className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500 rounded-xl p-6 hover:border-purple-400 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
//                     onClick={() => navigate(`/contests/${contest._id}`)}
//                   >
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="flex items-center gap-2">
//                         <span className="badge bg-green-500/20 text-green-400 border-green-500 animate-pulse">
//                           LIVE
//                         </span>
//                         <span className="badge bg-blue-500/20 text-blue-400 border-blue-500">
//                           {contest.difficulty || 'Medium'}
//                         </span>
//                       </div>
//                       <Trophy size={20} className="text-yellow-400" />
//                     </div>
                    
//                     <h3 className="text-xl font-bold text-white mb-3 line-clamp-1">{contest.title}</h3>
//                     <p className="text-gray-300 text-sm mb-4 line-clamp-2">{contest.description}</p>
                    
//                     <div className="space-y-3 mb-6">
//                       <div className="flex items-center gap-2 text-sm">
//                         <Clock size={16} className="text-red-400" />
//                         <span className="text-gray-400">Ends:</span>
//                         <span className="text-white">{formatDate(contest.endTime)}</span>
//                       </div>
//                       <div className="flex items-center gap-2 text-sm">
//                         <Users size={16} className="text-blue-400" />
//                         <span className="text-gray-400">Participants:</span>
//                         <span className="text-white">{contest.participants?.length || 0}</span>
//                       </div>
//                       <div className="flex items-center gap-2 text-sm">
//                         <Award size={16} className="text-yellow-400" />
//                         <span className="text-gray-400">Prize:</span>
//                         <span className="text-white">{contest.prizePool || 'Certificate'}</span>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center justify-between">
//                       <div className="text-sm text-purple-300">
//                         {calculateTimeRemaining(contest.endTime)} remaining
//                       </div>
//                       <button className="btn btn-sm bg-green-600 border-green-600 text-white hover:bg-green-700">
//                         Enter Contest
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Problems Section */}
//         <div>
//           <div className="flex items-center justify-between mb-8">
//             <h2 className="text-2xl font-bold text-white">Coding Problems</h2>
//             <div className="flex items-center gap-4">
//               <NavLink 
//                 to="/problems" 
//                 className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
//               >
//                 View all problems <ChevronRight size={18} />
//               </NavLink>
//             </div>
//           </div>

//           {/* Error Display */}
//           {error && (
//             <div className="alert alert-error mb-6">
//               <span>{error}</span>
//               <button 
//                 className="btn btn-sm" 
//                 onClick={() => dispatch(fetchProblems())}
//               >
//                 Retry
//               </button>
//             </div>
//           )}

//           {/* Filters */}
//           <div className="flex flex-wrap gap-4 mb-8 justify-center">
//             <select
//               className="select bg-black text-white border-purple-500 focus:border-purple-300"
//               value={filters.status}
//               onChange={(e) => handleFilterChange({ ...filters, status: e.target.value })}
//             >
//               <option value="all">All Problems</option>
//               <option value="solved">Solved</option>
//               <option value="unsolved">Unsolved</option>
//             </select>

//             <select
//               className="select bg-black text-white border-purple-500 focus:border-purple-300"
//               value={filters.difficulty}
//               onChange={(e) => handleFilterChange({ ...filters, difficulty: e.target.value })}
//             >
//               <option value="all">All Difficulties</option>
//               <option value="easy">Easy</option>
//               <option value="medium">Medium</option>
//               <option value="hard">Hard</option>
//             </select>

//             <select
//               className="select bg-black text-white border-purple-500 focus:border-purple-300"
//               value={filters.tag}
//               onChange={(e) => handleFilterChange({ ...filters, tag: e.target.value })}
//             >
//               <option value="all">All Tags</option>
//               <option value="array">Array</option>
//               <option value="linked list">Linked List</option>
//               <option value="graph">Graph</option>
//               <option value="dp">DP</option>
//               <option value="string">String</option>
//               <option value="tree">Tree</option>
//             </select>

//             {/* Refresh Button */}
//             <button
//               className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
//               onClick={() => {
//                 dispatch(fetchProblems());
//                 if (user) {
//                   dispatch(fetchSolvedProblems(user.id));
//                 }
//                 fetchContests();
//               }}
//               disabled={loading}
//             >
//               {loading ? 'Refreshing...' : 'Refresh'}
//             </button>
//           </div>

//           {/* Problems List */}
//           {filteredProblems.slice(0, 9).map(problem => {
//   if (!problem) return null; // Add this check
  
//   return (
//     <div key={problem._id} className="card bg-black/50 border border-purple-500 hover:border-purple-300 transition-colors hover:scale-[1.02]">
//       <div className="card-body">
//         <div className="flex items-start justify-between mb-3">
//           <h2 className="card-title text-white text-lg">
//             <NavLink
//               to={`/problem/${problem._id}`}
//               className="hover:text-purple-300 transition-colors"
//             >
//               {problem.title || 'Untitled Problem'}
//             </NavLink>
//           </h2>
          
//           <div className="flex flex-col gap-1 items-end">
//             {solvedSet.has(problem._id) && (
//               <div className="badge badge-success gap-1">
//                 ✓
//               </div>
//             )}
//             <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
//               {(problem.difficulty || 'Medium').toUpperCase()}
//             </div>
//           </div>
//         </div>

//         <p className="text-gray-300 text-sm mb-4 line-clamp-2">
//           {problem.description || 'No description available'}
//         </p>

//         <div className="flex justify-between items-center">
//           <div className="badge badge-outline text-purple-300 border-purple-500">
//             {problem.tags || 'General'}
//           </div>
//           <NavLink
//             to={`/problem/${problem._id}`}
//             className="btn btn-sm bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
//           >
//             Solve
//           </NavLink>
//         </div>
//       </div>
//     </div>
//   );
// })}

//           {/* Problems Count */}
//           <div className="mt-8 text-center text-purple-300">
//             Showing {Math.min(filteredProblems.length, 9)} of {problems.length} problems
//             {loading && <span className="loading loading-spinner loading-xs ml-2"></span>}
//             <div className="mt-4">
//               <NavLink 
//                 to="/problems" 
//                 className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
//               >
//                 View All Problems
//               </NavLink>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// const getDifficultyBadgeColor = (difficulty) => {
//   if (!difficulty) return 'badge-neutral';
  
//   switch (difficulty.toLowerCase()) {
//     case 'easy': return 'badge-success';
//     case 'medium': return 'badge-warning';
//     case 'hard': return 'badge-error';
//     default: return 'badge-neutral';
//   }
// };

// export default Homepage;