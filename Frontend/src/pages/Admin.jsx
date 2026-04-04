import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Home, Zap, Video, Trophy, Calendar, 
  Sparkles, Shield, Users, Settings, BarChart, Star, Code,
  ChevronRight, Crown
} from 'lucide-react';
import { NavLink } from 'react-router';

function Admin() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const adminOptions = [
    // Problem Management
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      color: 'from-green-500 to-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      color: 'from-yellow-500 to-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      color: 'from-red-500 to-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      route: '/admin/delete'
    },
    // Video Management
    {
      id: 'video',
      title: 'Video Problem',
      description: 'Upload And Delete Videos',
      icon: Video,
      color: 'from-blue-500 to-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      route: '/admin/video'
    },
    // Contest Management
    {
      id: 'create-contest',
      title: 'Create Contest',
      description: 'Organize a new coding competition',
      icon: Trophy,
      color: 'from-purple-500 to-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      route: '/admin/contests/create'
    },
    {
      id: 'update-contest',
      title: 'Update Contest',
      description: 'Modify existing contest details',
      icon: Calendar,
      color: 'from-yellow-500 to-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      route: '/admin/contests/update'
    },
    {
      id: 'delete-contest',
      title: 'Delete Contest',
      description: 'Remove contests permanently',
      icon: Trash2,
      color: 'from-red-500 to-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      route: '/admin/contests/delete'
    }
  ];

  // Group options by category
  const problemOptions = adminOptions.filter(opt =>
    !opt.id.includes('contest') && !opt.id.includes('video')
  );

  const contestOptions = adminOptions.filter(opt =>
    opt.id.includes('contest')
  );

  const videoOptions = adminOptions.filter(opt =>
    opt.id.includes('video')
  );

  // Stats data
  const stats = [
    { label: 'Total Problems', value: '156', icon: Code, color: 'from-purple-500 to-purple-400' },
    { label: 'Active Contests', value: '3', icon: Trophy, color: 'from-green-500 to-green-400' },
    { label: 'Total Users', value: '2.4k', icon: Users, color: 'from-blue-500 to-blue-400' },
    { label: 'Videos', value: '45', icon: Video, color: 'from-pink-500 to-pink-400' }
  ];

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
      <div className="absolute top-20 right-20 text-purple-500/10 animate-float">
        <Code size={80} />
      </div>
      <div className="absolute bottom-20 left-20 text-purple-500/10 animate-float animation-delay-1000">
        <Settings size={80} />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header with animation */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-70 animate-pulse"></div>
            <div className="relative bg-black rounded-full p-4">
              <Crown className="w-12 h-12 text-yellow-400" />
            </div>
          </div>
          
          <h1 className="text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient">
              Admin Dashboard
            </span>
          </h1>
          
          <p className="text-purple-300/80 text-lg max-w-2xl mx-auto flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Manage your platform's content and competitions
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </p>
        </div>

        {/* Quick Stats with animations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 hover:border-purple-400 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(128,0,128,0.3)] animate-slideIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl"></div>
                
                <div className="relative flex items-center gap-4">
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                      {stat.value}
                    </p>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                      {stat.label}
                    </p>
                  </div>
                </div>
                
                {/* Animated corner accent */}
                <div className="absolute bottom-0 right-0 w-12 h-12 overflow-hidden">
                  <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-gradient-to-tl from-purple-500/20 rotate-45 transform group-hover:scale-150 transition-transform duration-500"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Problem Management Section */}
        <div className="mb-12 animate-slideIn animation-delay-400">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative p-2 bg-black rounded-lg">
                <Zap size={24} className="text-purple-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Problem Management
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problemOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <div
                  key={option.id}
                  className="group relative bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-400 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(128,0,128,0.2)] animate-slideIn"
                  style={{ animationDelay: `${500 + index * 100}ms` }}
                  onMouseEnter={() => setHoveredCard(option.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  {/* Animated border */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur"></div>
                  </div>
                  
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`${option.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent size={28} className="text-purple-400" />
                      </div>
                      
                      {/* Status indicator */}
                      {hoveredCard === option.id && (
                        <div className="flex gap-1">
                          <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></span>
                          <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse animation-delay-200"></span>
                          <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse animation-delay-400"></span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {option.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-6 group-hover:text-gray-300 transition-colors">
                      {option.description}
                    </p>
                    
                    <NavLink
                      to={option.route}
                      className="relative inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-400 text-white px-4 py-2 rounded-lg font-medium overflow-hidden group/btn transition-all duration-300 hover:from-purple-500 hover:to-purple-300"
                    >
                      <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></span>
                      <span className="relative flex items-center gap-2">
                        Go to {option.title.split(' ')[0]}
                        <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </NavLink>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Video Management Section */}
        {videoOptions.length > 0 && (
          <div className="mb-12 animate-slideIn animation-delay-600">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative p-2 bg-black rounded-lg">
                  <Video size={24} className="text-blue-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Video Management
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoOptions.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <div
                    key={option.id}
                    className="group relative bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-xl overflow-hidden hover:border-blue-400 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] animate-slideIn"
                    style={{ animationDelay: `${700 + index * 100}ms` }}
                    onMouseEnter={() => setHoveredCard(option.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    <div className="relative p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`${option.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent size={28} className="text-blue-400" />
                        </div>
                        
                        {hoveredCard === option.id && (
                          <div className="flex gap-1">
                            <span className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></span>
                            <span className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-200"></span>
                            <span className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-400"></span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {option.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-6 group-hover:text-gray-300 transition-colors">
                        {option.description}
                      </p>
                      
                      <NavLink
                        to={option.route}
                        className="relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-2 rounded-lg font-medium overflow-hidden group/btn transition-all duration-300 hover:from-blue-500 hover:to-blue-300"
                      >
                        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></span>
                        <span className="relative flex items-center gap-2">
                          Manage Videos
                          <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                      </NavLink>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contest Management Section */}
        {contestOptions.length > 0 && (
          <div className="mb-12 animate-slideIn animation-delay-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative p-2 bg-black rounded-lg">
                  <Trophy size={24} className="text-green-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                Contest Management
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contestOptions.map((option, index) => {
                const IconComponent = option.icon;
                const isCreate = option.id.includes('create');
                const isUpdate = option.id.includes('update');
                const isDelete = option.id.includes('delete');

                let gradientFrom, gradientTo, hoverGradient;
                if (isCreate) {
                  gradientFrom = 'from-green-600';
                  gradientTo = 'to-green-400';
                } else if (isUpdate) {
                  gradientFrom = 'from-yellow-600';
                  gradientTo = 'to-yellow-400';
                } else {
                  gradientFrom = 'from-red-600';
                  gradientTo = 'to-red-400';
                }

                return (
                  <div
                    key={option.id}
                    className="group relative bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-xl overflow-hidden hover:border-green-400 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(34,197,94,0.2)] animate-slideIn"
                    style={{ animationDelay: `${900 + index * 100}ms` }}
                    onMouseEnter={() => setHoveredCard(option.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    <div className="relative p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`${option.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent size={28} className="text-green-400" />
                        </div>
                        
                        {hoveredCard === option.id && (
                          <div className="flex gap-1">
                            <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse animation-delay-200"></span>
                            <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse animation-delay-400"></span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-300 transition-colors">
                        {option.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-6 group-hover:text-gray-300 transition-colors">
                        {option.description}
                      </p>
                      
                      <NavLink
                        to={option.route}
                        className={`relative inline-flex items-center gap-2 bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white px-4 py-2 rounded-lg font-medium overflow-hidden group/btn transition-all duration-300 hover:scale-105`}
                      >
                        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></span>
                        <span className="relative flex items-center gap-2">
                          {isCreate && 'Create Contest'}
                          {isUpdate && 'Update Contest'}
                          {isDelete && 'Delete Contest'}
                          <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                      </NavLink>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Navigation */}
        <div className="relative group bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 mt-8 animate-slideIn animation-delay-1000">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl"></div>
          
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <BarChart size={24} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Quick Navigation</h3>
                <p className="text-purple-300 text-sm">Access key admin functions quickly</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <NavLink
                to="/contests"
                className="relative group/btn bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              >
                <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></span>
                <span className="relative flex items-center gap-2">
                  <Trophy size={18} />
                  View All Contests
                </span>
              </NavLink>
              
              <NavLink
                to="/"
                className="relative group/btn border border-purple-500/50 text-purple-300 px-6 py-2 rounded-lg font-medium overflow-hidden transition-all duration-300 hover:border-purple-400 hover:text-white"
              >
                <span className="absolute inset-0 bg-purple-500/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></span>
                <span className="relative flex items-center gap-2">
                  <Home size={18} />
                  Home
                </span>
              </NavLink>
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
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
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
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
      `}</style>
    </div>
  );
}

export default Admin;

// import React, { useState } from 'react';
// import { Plus, Edit, Trash2, Home, RefreshCw, Zap, Video, Trophy,Calendar } from 'lucide-react';
// import { NavLink } from 'react-router';

// function Admin() {
//   const [selectedOption, setSelectedOption] = useState(null);

//   const adminOptions = [
//     // Problem Management
//     {
//       id: 'create',
//       title: 'Create Problem',
//       description: 'Add a new coding problem to the platform',
//       icon: Plus,
//       color: 'btn-success',
//       bgColor: 'bg-success/10',
//       route: '/admin/create'
//     },
//     {
//       id: 'update',
//       title: 'Update Problem',
//       description: 'Edit existing problems and their details',
//       icon: Edit,
//       color: 'btn-warning',
//       bgColor: 'bg-warning/10',
//       route: '/admin/update'
//     },
//     {
//       id: 'delete',
//       title: 'Delete Problem',
//       description: 'Remove problems from the platform',
//       icon: Trash2,
//       color: 'btn-error',
//       bgColor: 'bg-error/10',
//       route: '/admin/delete'
//     },
//     // Video Management
//     {
//       id: 'video',
//       title: 'Video Problem',
//       description: 'Upload And Delete Videos',
//       icon: Video,
//       color: 'btn-success',
//       bgColor: 'bg-success/10',
//       route: '/admin/video'
//     },
//     // Contest Management (ONLY CREATE)
//     {
//       id: 'create-contest',
//       title: 'Create Contest',
//       description: 'Organize a new coding competition',
//       icon: Trophy,
//       color: 'btn-primary',
//       bgColor: 'bg-blue-500/10',
//       route: '/admin/contests/create'
//     },
//     // For Update Contest - show list to select which contest to update
//     {
//       id: 'update-contest',
//       title: 'Update Contest',
//       description: 'Modify existing contest details',
//       icon: Calendar,
//       color: 'btn-warning',
//       bgColor: 'bg-yellow-500/10',
//       route: '/admin/contests/update' // Page that lists all contests with edit buttons
//     },
//     // For Delete Contest - show list to select which contest to delete
//     {
//       id: 'delete-contest',
//       title: 'Delete Contest',
//       description: 'Remove contests permanently',
//       icon: Trash2,
//       color: 'btn-error',
//       bgColor: 'bg-red-500/10',
//       route: '/admin/contests/delete' // Same page, but with delete options
//     }

//   ];

//   // Group options by category
//   const problemOptions = adminOptions.filter(opt =>
//     opt.id.includes('create') || opt.id.includes('update') || opt.id.includes('delete')
//   ).filter(opt => !opt.id.includes('contest'));

//   const contestOptions = adminOptions.filter(opt =>
//     opt.id.includes('contest')
//   );

//   const videoOptions = adminOptions.filter(opt =>
//     opt.id.includes('video')
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black">
//       <div className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-white mb-4">
//             Admin Dashboard
//           </h1>
//           <p className="text-purple-300 text-lg">
//             Manage your platform's content and competitions
//           </p>
//         </div>

//         {/* Quick Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
//           <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-5">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-purple-500/20 rounded-lg">
//                 <Plus size={22} className="text-purple-400" />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold text-white">Create</p>
//                 <p className="text-sm text-purple-300">New Problems & Contests</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-5">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-500/20 rounded-lg">
//                 <Edit size={22} className="text-blue-400" />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold text-white">Update</p>
//                 <p className="text-sm text-blue-300">Existing Content</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/30 rounded-xl p-5">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-red-500/20 rounded-lg">
//                 <Trash2 size={22} className="text-red-400" />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold text-white">Delete</p>
//                 <p className="text-sm text-red-300">Remove Content</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-5">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-green-500/20 rounded-lg">
//                 <Trophy size={22} className="text-green-400" />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold text-white">Contests</p>
//                 <p className="text-sm text-green-300">Organize Competitions</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Problem Management Section */}
//         <div className="mb-12">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="p-2 bg-purple-500/20 rounded-lg">
//               <Zap size={24} className="text-purple-400" />
//             </div>
//             <h2 className="text-2xl font-bold text-white">Problem Management</h2>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {problemOptions.map((option) => {
//               const IconComponent = option.icon;
//               return (
//                 <div
//                   key={option.id}
//                   className="card bg-black/50 border border-purple-500/30 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
//                 >
//                   <div className="card-body items-center text-center p-6">
//                     <div className={`${option.bgColor} p-3 rounded-full mb-3`}>
//                       <IconComponent size={28} className="text-purple-400" />
//                     </div>
//                     <h3 className="card-title text-lg mb-2 text-white">
//                       {option.title}
//                     </h3>
//                     <p className="text-purple-300 text-sm mb-4">
//                       {option.description}
//                     </p>
//                     <div className="card-actions">
//                       <NavLink
//                         to={option.route}
//                         className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700 btn-sm"
//                       >
//                         Go to {option.title.split(' ')[0]}
//                       </NavLink>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Video Management Section */}
//         {videoOptions.length > 0 && (
//           <div className="mb-12">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="p-2 bg-blue-500/20 rounded-lg">
//                 <Video size={24} className="text-blue-400" />
//               </div>
//               <h2 className="text-2xl font-bold text-white">Video Management</h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {videoOptions.map((option) => {
//                 const IconComponent = option.icon;
//                 return (
//                   <div
//                     key={option.id}
//                     className="card bg-black/50 border border-blue-500/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
//                   >
//                     <div className="card-body items-center text-center p-6">
//                       <div className={`${option.bgColor} p-3 rounded-full mb-3`}>
//                         <IconComponent size={28} className="text-blue-400" />
//                       </div>
//                       <h3 className="card-title text-lg mb-2 text-white">
//                         {option.title}
//                       </h3>
//                       <p className="text-blue-300 text-sm mb-4">
//                         {option.description}
//                       </p>
//                       <div className="card-actions">
//                         <NavLink
//                           to={option.route}
//                           className="btn bg-blue-600 border-blue-600 text-white hover:bg-blue-700 btn-sm"
//                         >
//                           Manage Videos
//                         </NavLink>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}


//         {/* Contest Management Section - CREATE, UPDATE, DELETE */}
//         {contestOptions.length > 0 && (
//           <div className="mb-12">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="p-2 bg-green-500/20 rounded-lg">
//                 <Trophy size={24} className="text-green-400" />
//               </div>
//               <h2 className="text-2xl font-bold text-white">Contest Management</h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {contestOptions.map((option) => {
//                 const IconComponent = option.icon;
//                 const isCreate = option.id.includes('create');
//                 const isUpdate = option.id.includes('update');
//                 const isDelete = option.id.includes('delete');

//                 // Determine button color and text based on action
//                 let buttonColor = "bg-green-600 border-green-600 hover:bg-green-700";
//                 let buttonText = option.title.split(' ')[0];

//                 if (isUpdate) {
//                   buttonColor = "bg-yellow-600 border-yellow-600 hover:bg-yellow-700";
//                 } else if (isDelete) {
//                   buttonColor = "bg-red-600 border-red-600 hover:bg-red-700";
//                 }

//                 return (
//                   <div
//                     key={option.id}
//                     className="card bg-black/50 border border-green-500/30 shadow-xl hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
//                   >
//                     <div className="card-body items-center text-center p-6">
//                       <div className={`${option.bgColor} p-3 rounded-full mb-3`}>
//                         <IconComponent size={28} className="text-green-400" />
//                       </div>
//                       <h3 className="card-title text-lg mb-2 text-white">
//                         {option.title}
//                       </h3>
//                       <p className="text-green-300 text-sm mb-4">
//                         {option.description}
//                       </p>
//                       <div className="card-actions">
//                         <NavLink
//                           to={option.route}
//                           className={`btn ${buttonColor} text-white btn-sm`}
//                         >
//                           {isCreate && 'Create New Contest'}
//                           {isUpdate && 'Update Contest'}
//                           {isDelete && 'Delete Contest'}
//                         </NavLink>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* Quick Navigation */}
//         <div className="card bg-black/40 border border-purple-500/30 p-6">
//           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//             <div>
//               <h3 className="text-lg font-bold text-white mb-2">Quick Navigation</h3>
//               <p className="text-purple-300">Access key admin functions quickly</p>
//             </div>
//             <div className="flex gap-3">
//               <NavLink
//                 to="/contests"
//                 className="btn bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white"
//               >
//                 View All Contests
//               </NavLink>
//               <NavLink
//                 to="/"
//                 className="btn btn-outline border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white"
//               >
//                 <Home size={20} className="mr-2" />
//                 Home
//               </NavLink>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Admin;