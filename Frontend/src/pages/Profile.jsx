import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router';
import { Trophy, Star, Calendar, Code, Sparkles, Zap, Award, Target, Crown, Clock, Users, TrendingUp } from 'lucide-react';

function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const { problems, solvedProblems } = useSelector((state) => state.problems);
  
  const [userStats, setUserStats] = useState({
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0
  });
  const [loading, setLoading] = useState(true);
  const [hoveredMilestone, setHoveredMilestone] = useState(null);

  useEffect(() => {
    const calculateStats = () => {
      const totalSolved = solvedProblems.length;
      const easySolved = solvedProblems.filter(p => p.difficulty === 'easy').length;
      const mediumSolved = solvedProblems.filter(p => p.difficulty === 'medium').length;
      const hardSolved = solvedProblems.filter(p => p.difficulty === 'hard').length;

      setUserStats({
        totalSolved,
        easySolved,
        mediumSolved,
        hardSolved
      });
      setLoading(false);
    };

    calculateStats();
  }, [solvedProblems]);

  const getProfilePictureUrl = () => {
    if (user?.profilePic) {
      return user.profilePic.startsWith("http")
        ? user.profilePic
        : `http://localhost:5005/${user.profilePic}`;
    }
    return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  };

  // Calculate completion percentages
  const easyTotal = problems.filter(p => p.difficulty === 'easy').length;
  const mediumTotal = problems.filter(p => p.difficulty === 'medium').length;
  const hardTotal = problems.filter(p => p.difficulty === 'hard').length;
  
  const easyPercentage = easyTotal > 0 ? (userStats.easySolved / easyTotal) * 100 : 0;
  const mediumPercentage = mediumTotal > 0 ? (userStats.mediumSolved / mediumTotal) * 100 : 0;
  const hardPercentage = hardTotal > 0 ? (userStats.hardSolved / hardTotal) * 100 : 0;
  
  const overallPercentage = problems.length > 0 ? (userStats.totalSolved / problems.length) * 100 : 0;

  if (loading) {
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
            Loading your profile...
          </p>
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

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        
        {/* Header with animation */}
        <div className="text-center mb-8 animate-fadeIn">
          <NavLink 
            to="/" 
            className="group inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 transition-all hover:gap-3"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
            Back to Problems
          </NavLink>
          
          <h1 className="text-5xl font-black mb-2 relative inline-block">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient">
              Profile
            </span>
            <Sparkles className="absolute -top-6 -right-8 w-6 h-6 text-yellow-400 animate-pulse" />
          </h1>
        </div>

        {/* Profile Card */}
        <div className="group relative bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl mb-6 hover:border-purple-400 transition-all duration-500 hover:shadow-[0_0_30px_rgba(128,0,128,0.3)] animate-slideIn">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"></div>
          
          <div className="card-body relative">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Picture with animated border */}
              <div className="flex-shrink-0 relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-spin-slow"></div>
                <img
                  src={getProfilePictureUrl()}
                  className="relative w-28 h-28 rounded-full border-4 border-purple-500 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  alt="Profile"
                />
                {userStats.totalSolved > 0 && (
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full p-1.5 animate-bounce">
                    <Crown size={16} className="text-white" />
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {user?.firstName} {user?.lastName}
                </h2>
                
                <p className="text-gray-300/80 mb-4 flex items-center justify-center md:justify-start gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {user?.email}
                </p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <div className="badge bg-purple-500/20 text-purple-300 border-purple-500/50 px-3 py-2">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {user?.role || 'Member'}
                  </div>
                  <div className="badge bg-purple-500/10 text-purple-300 border-purple-500/30 px-3 py-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    Joined {new Date().toLocaleString('default', { month: 'short' })} 2024
                  </div>
                  {userStats.totalSolved > 0 && (
                    <div className="badge bg-green-500/20 text-green-400 border-green-500/30 px-3 py-2">
                      <Zap className="w-3 h-3 mr-1" />
                      {userStats.totalSolved} problems solved
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Overall Stats */}
          <div className="group relative bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl hover:border-purple-400 transition-all duration-500 hover:shadow-[0_0_30px_rgba(128,0,128,0.2)] animate-slideIn animation-delay-200">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"></div>
            
            <div className="card-body relative">
              <h3 className="card-title text-white text-xl mb-6 flex items-center gap-2">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Coding Statistics
                </span>
              </h3>
              
              <div className="space-y-4">
                <div className="relative p-4 bg-purple-500/5 rounded-lg border border-purple-500/20 group-hover:border-purple-500/40 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-300">Total Solved</span>
                    <span className="text-white font-bold text-xl">{userStats.totalSolved}</span>
                  </div>
                  <div className="w-full bg-purple-500/20 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${overallPercentage}%` }}
                    ></div>
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20 group-hover:border-purple-500/40 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Total Problems</span>
                    <span className="text-white font-bold text-xl">{problems.length}</span>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20 group-hover:border-purple-500/40 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Completion Rate</span>
                    <span className="text-white font-bold text-xl">
                      {problems.length > 0 ? Math.round((userStats.totalSolved / problems.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="group relative bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl hover:border-purple-400 transition-all duration-500 hover:shadow-[0_0_30px_rgba(128,0,128,0.2)] animate-slideIn animation-delay-400">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"></div>
            
            <div className="card-body relative">
              <h3 className="card-title text-white text-xl mb-6 flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Code className="w-5 h-5 text-purple-400" />
                </div>
                <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Difficulty Breakdown
                </span>
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-all duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-300 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Easy
                    </span>
                    <span className="text-white font-bold">{userStats.easySolved} / {easyTotal}</span>
                  </div>
                  <div className="w-full bg-green-500/20 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${easyPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-yellow-300 flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      Medium
                    </span>
                    <span className="text-white font-bold">{userStats.mediumSolved} / {mediumTotal}</span>
                  </div>
                  <div className="w-full bg-yellow-500/20 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${mediumPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="p-4 bg-red-500/5 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-all duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-red-300 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      Hard
                    </span>
                    <span className="text-white font-bold">{userStats.hardSolved} / {hardTotal}</span>
                  </div>
                  <div className="w-full bg-red-500/20 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-red-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${hardPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Section */}
        <div className="group relative bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl mb-6 hover:border-purple-400 transition-all duration-500 hover:shadow-[0_0_30px_rgba(128,0,128,0.2)] animate-slideIn animation-delay-600">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"></div>
          
          <div className="card-body relative">
            <h3 className="card-title text-white text-xl mb-6 flex items-center gap-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Milestones
              </span>
              <Star className="w-5 h-5 text-yellow-400 animate-pulse ml-2" />
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { 
                  name: 'First Problem', 
                  icon: Target,
                  earned: userStats.totalSolved > 0, 
                  description: 'Solve your first coding problem',
                  color: 'green'
                },
                { 
                  name: '5 Problems', 
                  icon: Zap,
                  earned: userStats.totalSolved >= 5, 
                  description: 'Solve 5 coding problems',
                  color: 'yellow'
                },
                { 
                  name: '10 Problems', 
                  icon: Trophy,
                  earned: userStats.totalSolved >= 10, 
                  description: 'Solve 10 coding problems',
                  color: 'purple'
                },
                { 
                  name: 'All Easy', 
                  icon: Sparkles,
                  earned: userStats.easySolved >= easyTotal && easyTotal > 0, 
                  description: 'Solve all easy problems',
                  color: 'pink'
                },
              ].map((milestone, index) => {
                const Icon = milestone.icon;
                return (
                  <div 
                    key={index}
                    className="relative group/milestone"
                    onMouseEnter={() => setHoveredMilestone(index)}
                    onMouseLeave={() => setHoveredMilestone(null)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r from-${milestone.color}-500/0 via-${milestone.color}-500/5 to-${milestone.color}-500/0 opacity-0 group-hover/milestone:opacity-100 transition-opacity duration-700 rounded-xl`}></div>
                    
                    <div 
                      className={`relative p-5 rounded-xl border-2 transition-all duration-500 ${
                        milestone.earned 
                          ? `bg-${milestone.color}-500/10 border-${milestone.color}-500/50 hover:border-${milestone.color}-400 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]` 
                          : 'bg-gray-500/5 border-gray-500/30 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          milestone.earned ? `bg-${milestone.color}-500/20` : 'bg-gray-500/20'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            milestone.earned ? `text-${milestone.color}-400` : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold mb-1 ${
                            milestone.earned ? 'text-white' : 'text-gray-400'
                          }`}>
                            {milestone.name}
                          </div>
                          <div className={`text-sm ${
                            milestone.earned ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            {milestone.description}
                          </div>
                          <div className={`text-xs mt-2 flex items-center gap-1 ${
                            milestone.earned ? 'text-green-400' : 'text-gray-500'
                          }`}>
                            {milestone.earned ? (
                              <>
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                Completed
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                Locked
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Animated checkmark for earned milestones */}
                      {milestone.earned && hoveredMilestone === index && (
                        <div className="absolute -top-1 -right-1 animate-bounce">
                          <span className="flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8 animate-slideIn animation-delay-800">
          <NavLink 
            to="/" 
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-purple-400 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-500 hover:to-purple-300 transition-all duration-500 overflow-hidden"
          >
            <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            <span className="relative flex items-center gap-2">
              <Code size={20} className="group-hover:rotate-12 transition-transform" />
              Continue Solving Problems
              <TrendingUp size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </NavLink>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-gradient {
          background-size: 300% 300%;
          animation: gradient 6s ease infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
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
      `}</style>
    </div>
  );
}

export default ProfilePage;

// import { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { NavLink } from 'react-router';
// import { Trophy, Star, Calendar, Code } from 'lucide-react';

// function ProfilePage() {
//   const { user } = useSelector((state) => state.auth);
//   const { problems, solvedProblems } = useSelector((state) => state.problems);
  
//   const [userStats, setUserStats] = useState({
//     totalSolved: 0,
//     easySolved: 0,
//     mediumSolved: 0,
//     hardSolved: 0
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const calculateStats = () => {
//       const totalSolved = solvedProblems.length;
//       const easySolved = solvedProblems.filter(p => p.difficulty === 'easy').length;
//       const mediumSolved = solvedProblems.filter(p => p.difficulty === 'medium').length;
//       const hardSolved = solvedProblems.filter(p => p.difficulty === 'hard').length;

//       setUserStats({
//         totalSolved,
//         easySolved,
//         mediumSolved,
//         hardSolved
//       });
//       setLoading(false);
//     };

//     calculateStats();
//   }, [solvedProblems]);

//   const getProfilePictureUrl = () => {
//     if (user?.profilePic) {
//       return user.profilePic.startsWith("http")
//         ? user.profilePic
//         : `http://localhost:5005/${user.profilePic}`;
//     }
//     return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
//         <div className="text-center">
//           <div className="loading loading-spinner loading-lg text-purple-400"></div>
//           <p className="text-white mt-4">Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8">
//       <div className="container mx-auto px-4 max-w-4xl">
        
//         {/* Header */}
//         <div className="text-center mb-8">
//           <NavLink to="/" className="btn btn-ghost text-purple-400 mb-6">
//             ← Back to Problems
//           </NavLink>
//           <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
//         </div>

//         {/* Profile Card */}
//         <div className="card bg-black/50 border border-purple-500 rounded-2xl mb-6">
//           <div className="card-body">
//             <div className="flex flex-col md:flex-row items-center gap-6">
//               {/* Profile Picture */}
//               <div className="flex-shrink-0">
//                 <img
//                   src={getProfilePictureUrl()}
//                   className="w-24 h-24 rounded-full border-2 border-purple-500 object-cover"
//                   alt="Profile"
//                 />
//               </div>
              
//               {/* User Info */}
//               <div className="flex-1 text-center md:text-left">
//                 <h2 className="text-2xl font-bold text-white mb-2">
//                   {user?.firstName} {user?.lastName}
//                 </h2>
                
//                 <p className="text-gray-300 mb-4">
//                   {user?.email}
//                 </p>

//                 <div className="flex flex-wrap gap-2 justify-center md:justify-start">
//                   <div className="badge bg-purple-500/20 text-purple-300 border-purple-500">
//                     {user?.role || 'Member'}
//                   </div>
//                   <div className="badge bg-gray-500/20 text-gray-300 border-gray-500 flex items-center gap-1">
//                     <Calendar className="w-3 h-3" />
//                     Joined Jan 2024
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stats Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
//           {/* Overall Stats */}
//           <div className="card bg-black/50 border border-purple-500 rounded-2xl">
//             <div className="card-body">
//               <h3 className="card-title text-white mb-4 flex items-center gap-2">
//                 <Trophy className="w-5 h-5 text-yellow-400" />
//                 Coding Statistics
//               </h3>
              
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
//                   <span className="text-purple-300">Total Solved</span>
//                   <span className="text-white font-bold text-lg">{userStats.totalSolved}</span>
//                 </div>
                
//                 <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
//                   <span className="text-purple-300">Total Problems</span>
//                   <span className="text-white font-bold text-lg">{problems.length}</span>
//                 </div>
                
//                 <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
//                   <span className="text-purple-300">Completion Rate</span>
//                   <span className="text-white font-bold text-lg">
//                     {problems.length > 0 ? Math.round((userStats.totalSolved / problems.length) * 100) : 0}%
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Difficulty Breakdown */}
//           <div className="card bg-black/50 border border-purple-500 rounded-2xl">
//             <div className="card-body">
//               <h3 className="card-title text-white mb-4 flex items-center gap-2">
//                 <Code className="w-5 h-5 text-purple-400" />
//                 Difficulty Breakdown
//               </h3>
              
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
//                   <span className="text-green-300">Easy</span>
//                   <span className="text-white font-bold">
//                     {userStats.easySolved} / {problems.filter(p => p.difficulty === 'easy').length}
//                   </span>
//                 </div>
                
//                 <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
//                   <span className="text-yellow-300">Medium</span>
//                   <span className="text-white font-bold">
//                     {userStats.mediumSolved} / {problems.filter(p => p.difficulty === 'medium').length}
//                   </span>
//                 </div>
                
//                 <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/30">
//                   <span className="text-red-300">Hard</span>
//                   <span className="text-white font-bold">
//                     {userStats.hardSolved} / {problems.filter(p => p.difficulty === 'hard').length}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Simple Achievements */}
//         <div className="card bg-black/50 border border-purple-500 rounded-2xl mb-6">
//           <div className="card-body">
//             <h3 className="card-title text-white mb-4 flex items-center gap-2">
//               <Star className="w-5 h-5 text-purple-400" />
//               Milestones
//             </h3>
            
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {[
//                 { 
//                   name: 'First Problem', 
//                   earned: userStats.totalSolved > 0, 
//                   description: 'Solve your first coding problem'
//                 },
//                 { 
//                   name: '5 Problems', 
//                   earned: userStats.totalSolved >= 5, 
//                   description: 'Solve 5 coding problems'
//                 },
//                 { 
//                   name: '10 Problems', 
//                   earned: userStats.totalSolved >= 10, 
//                   description: 'Solve 10 coding problems'
//                 },
//                 { 
//                   name: 'All Easy', 
//                   earned: userStats.easySolved >= problems.filter(p => p.difficulty === 'easy').length && problems.filter(p => p.difficulty === 'easy').length > 0, 
//                   description: 'Solve all easy problems'
//                 },
//               ].map((milestone, index) => (
//                 <div 
//                   key={index}
//                   className={`p-4 rounded-lg border-2 ${
//                     milestone.earned 
//                       ? 'bg-green-500/10 border-green-500 text-white' 
//                       : 'bg-gray-500/10 border-gray-500 text-gray-400'
//                   }`}
//                 >
//                   <div className="font-semibold mb-1">{milestone.name}</div>
//                   <div className="text-sm opacity-75">{milestone.description}</div>
//                   <div className="text-xs mt-2">
//                     {milestone.earned ? '✅ Completed' : '🔒 Locked'}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Call to Action */}
//         <div className="text-center">
//           <NavLink to="/" className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700 btn-lg">
//             Continue Solving Problems
//           </NavLink>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ProfilePage;
