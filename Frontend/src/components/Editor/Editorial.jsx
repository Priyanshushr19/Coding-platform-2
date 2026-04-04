import { useState, useRef, useEffect } from 'react';
import { Pause, Play, Volume2, VolumeX, Maximize2, Minimize2, Film, Sparkles } from 'lucide-react';

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    console.log("Editorial props:", { secureUrl, thumbnailUrl, duration });
  }, []);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        // Auto-hide controls after 3 seconds when playing
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
          if (!isHovering) setShowControls(false);
        }, 3000);
      }).catch(error => {
        console.error('Error playing video:', error);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowControls(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);

    // If unmuting, restore previous volume
    if (!videoRef.current.muted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (!videoRef.current) return;

    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    videoRef.current.muted = newVolume === 0;
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isHovering) setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleLoadedData = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    // Set initial volume
    video.volume = volume;

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  if (!secureUrl) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-purple-900/20 to-black/40 border border-purple-500/30 rounded-xl">
        <div className="relative inline-block mb-4">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-50 animate-pulse"></div>
          <div className="relative bg-black rounded-full p-4">
            <Film className="w-16 h-16 text-purple-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Video Available</h3>
        <p className="text-purple-300/70">Editorial video is not available for this problem.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-black group"
      onMouseEnter={() => {
        setIsHovering(true);
        setShowControls(true);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        if (isPlaying) {
          setShowControls(false);
        }
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Film className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        src={secureUrl}
        poster={thumbnailUrl}
        playsInline
        preload="metadata"
        className="w-full aspect-video bg-black cursor-pointer"
        onClick={togglePlayPause}
      />

      {/* Gradient Overlay for Controls */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`} />

      {/* Video Controls */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 transform ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
        {/* Progress Bar */}
        <div className="flex items-center w-full mb-3">
          <span className="text-white text-xs mr-2 min-w-[40px] font-mono">
            {formatTime(currentTime)}
          </span>
          
          <div className="relative flex-1 group/range">
            <input
              type="range"
              min="0"
              max={videoRef.current?.duration || duration || 100}
              value={currentTime}
              onChange={(e) => {
                if (videoRef.current) {
                  const newTime = parseFloat(e.target.value);
                  videoRef.current.currentTime = newTime;
                  setCurrentTime(newTime);
                }
              }}
              className="absolute opacity-0 w-full h-2 cursor-pointer z-20"
            />
            <div className="w-full h-2 bg-purple-500/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                style={{ width: `${(currentTime / (videoRef.current?.duration || duration || 1)) * 100}%` }}
              />
            </div>
            {/* Hover preview dot */}
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/range:opacity-100 transition-opacity"
                 style={{ left: `${(currentTime / (videoRef.current?.duration || duration || 1)) * 100}%` }} />
          </div>
          
          <span className="text-white text-xs ml-2 min-w-[40px] font-mono">
            {formatTime(videoRef.current?.duration || duration)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="group/btn relative w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-110 transition-transform duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
              <span className="relative flex items-center justify-center">
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </span>
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-2 py-1 border border-purple-500/30">
              <button
                onClick={toggleMute}
                className="w-8 h-8 rounded-full hover:bg-purple-500/20 flex items-center justify-center transition-colors"
              >
                {isMuted || volume === 0 ? 
                  <VolumeX size={16} className="text-purple-400" /> : 
                  <Volume2 size={16} className="text-purple-400" />
                }
              </button>

              <div className="relative w-16 group/volume">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="absolute opacity-0 w-full h-4 cursor-pointer z-20"
                />
                <div className="w-full h-1 bg-purple-500/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Video Status */}
            <div className="bg-black/50 backdrop-blur-md rounded-full px-3 py-1 border border-purple-500/30">
              <span className="text-xs text-purple-300 flex items-center gap-1">
                <Sparkles size={12} className="text-yellow-400" />
                {isPlaying ? 'Playing' : 'Paused'}
              </span>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-purple-500/30 hover:border-purple-400 flex items-center justify-center transition-all hover:scale-110"
            >
              {isFullscreen ? 
                <Minimize2 size={16} className="text-purple-400" /> : 
                <Maximize2 size={16} className="text-purple-400" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Center Play Button when paused and not hovering */}
      {!isPlaying && !isHovering && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlayPause}
            className="group/btn relative w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-110 transition-all duration-300 overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.5)]"
          >
            <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
            <span className="relative flex items-center justify-center">
              <Play size={28} className="ml-1" />
            </span>
          </button>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Editorial;

// import { useState, useRef, useEffect } from 'react';
// import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

// const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
//   const videoRef = useRef(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [isHovering, setIsHovering] = useState(false);
//   const [volume, setVolume] = useState(1);
//   const [isMuted, setIsMuted] = useState(false);

//   useEffect(() => {
//     console.log("Editorial props:", { secureUrl, thumbnailUrl, duration });
//   }, []);

//   // }, [secureUrl, thumbnailUrl, duration]);

//   const formatTime = (seconds) => {
//     if (!seconds || isNaN(seconds)) return '0:00';
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//   };

//   const togglePlayPause = () => {
//     if (!videoRef.current) return;

//     if (videoRef.current.paused) {
//       videoRef.current.play().then(() => {
//         setIsPlaying(true);
//       }).catch(error => {
//         console.error('Error playing video:', error);
//       });
//     } else {
//       videoRef.current.pause();
//       setIsPlaying(false);
//     }
//   };

//   const toggleMute = () => {
//     if (!videoRef.current) return;

//     videoRef.current.muted = !videoRef.current.muted;
//     setIsMuted(videoRef.current.muted);

//     // If unmuting, restore previous volume
//     if (!videoRef.current.muted && volume === 0) {
//       setVolume(0.5);
//       videoRef.current.volume = 0.5;
//     }
//   };

//   const handleVolumeChange = (e) => {
//     const newVolume = parseFloat(e.target.value);
//     if (!videoRef.current) return;

//     setVolume(newVolume);
//     videoRef.current.volume = newVolume;
//     videoRef.current.muted = newVolume === 0;
//     setIsMuted(newVolume === 0);
//   };

//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     const updateTime = () => setCurrentTime(video.currentTime);

//     const handlePlay = () => setIsPlaying(true);
//     const handlePause = () => setIsPlaying(false);
//     const handleEnded = () => setIsPlaying(false);

//     video.addEventListener('timeupdate', updateTime);
//     video.addEventListener('play', handlePlay);
//     video.addEventListener('pause', handlePause);
//     video.addEventListener('ended', handleEnded);

//     // Set initial volume
//     video.volume = volume;

//     return () => {
//       video.removeEventListener('timeupdate', updateTime);
//       video.removeEventListener('play', handlePlay);
//       video.removeEventListener('pause', handlePause);
//       video.removeEventListener('ended', handleEnded);
//     };
//   }, []);

//   if (!secureUrl) {
//     return (
//       <div className="text-center py-8">
//         <div className="text-gray-400 mb-4">
//           <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//           </svg>
//         </div>
//         <h3 className="text-lg font-semibold text-gray-600 mb-2">No Video Available</h3>
//         <p className="text-gray-500">Editorial video is not available for this problem.</p>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-lg bg-black"
//       onMouseEnter={() => setIsHovering(true)}
//       onMouseLeave={() => setIsHovering(false)}
//     >
//       <video
//         ref={videoRef}
//         src={secureUrl}
//         poster={thumbnailUrl}
//         playsInline
//         preload="metadata"
//         className="w-full aspect-video bg-black cursor-pointer"
//       // Removed muted attribute to enable sound
//       />

//       {/* Video Controls */}
//       <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-all duration-300 ${isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'
//         }`}>

//         {/* Progress Bar */}
//         <div className="flex items-center w-full mb-3">
//           <span className="text-white text-xs mr-2 min-w-[40px]">
//             {formatTime(currentTime)}
//           </span>
//           <input
//             type="range"
//             min="0"
//             max={videoRef.current?.duration || duration || 100}
//             value={currentTime}
//             onChange={(e) => {
//               if (videoRef.current) {
//                 const newTime = parseFloat(e.target.value);
//                 videoRef.current.currentTime = newTime;
//                 setCurrentTime(newTime);
//               }
//             }}
//             className="range range-primary range-xs flex-1"
//           />
//           <span className="text-white text-xs ml-2 min-w-[40px]">
//             {formatTime(videoRef.current?.duration || duration)}
//           </span>
//         </div>

//         {/* Control Buttons */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center">
//             {/* Play/Pause Button */}
//             <button
//               onClick={togglePlayPause}
//               className="btn btn-circle btn-primary btn-sm mr-3"
//             >
//               {isPlaying ? <Pause size={16} /> : <Play size={16} />}
//             </button>

//             {/* Volume Control */}
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={toggleMute}
//                 className="btn btn-ghost btn-sm btn-circle"
//               >
//                 {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
//               </button>

//               <input
//                 type="range"
//                 min="0"
//                 max="1"
//                 step="0.1"
//                 value={volume}
//                 onChange={handleVolumeChange}
//                 className="range range-accent range-xs w-20"
//               />
//             </div>
//           </div>

//           {/* Video Title or Status */}
//           <div className="text-white text-sm">
//             {isPlaying ? 'Playing' : 'Paused'}
//           </div>
//         </div>
//       </div>

//       {/* Play button overlay when paused and not hovering */}
//       {!isPlaying && !isHovering && (
//         <div className="absolute inset-0 flex items-center justify-center">
//           <button
//             onClick={togglePlayPause}
//             className="btn btn-circle btn-primary btn-lg bg-black/50 border-none hover:bg-black/70"
//           >
//             <Play size={24} />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Editorial;