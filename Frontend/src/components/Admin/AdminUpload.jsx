import { useLocation, useParams } from 'react-router';
import React, { useState , useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../../Utils/axiosClient';
import { 
  Upload, Video, CheckCircle, XCircle, AlertCircle,
  Loader, FileText, Clock, Calendar, Sparkles,
  Zap, Shield, ArrowLeft, Save, Trash2
} from 'lucide-react';

function AdminUpload() {
    const { problemId } = useParams();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedVideo, setUploadedVideo] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
        setError,
        clearErrors
    } = useForm();

    const selectedFile = watch('videoFile')?.[0];

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            // You'll need to set this to your form
            // This is a simplified example - you might need to use react-hook-form's setValue
            const input = document.querySelector('input[type="file"]');
            if (input) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(files[0]);
                input.files = dataTransfer.files;
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
            }
        }
    };

    // Upload video to Cloudinary
    const onSubmit = async (data) => {
        const file = data.videoFile[0];

        setUploading(true);
        setUploadProgress(0);
        clearErrors();

        try {
            // Step 1: Get upload signature from backend
            const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
            const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

            // Step 2: Create FormData for Cloudinary upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp);
            formData.append('public_id', public_id);
            formData.append('api_key', api_key);

            // Step 3: Upload directly to Cloudinary
            const uploadResponse = await axios.post(upload_url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                },
            });

            const cloudinaryResult = uploadResponse.data;

            // Step 4: Save video metadata to backend
            const metadataResponse = await axiosClient.post('/video/save', {
                problemId: problemId,
                cloudinaryPublicId: cloudinaryResult.public_id,
                secureUrl: cloudinaryResult.secure_url,
                duration: cloudinaryResult.duration,
            });

            setUploadedVideo(metadataResponse.data.videoSolution);
            reset(); // Reset form after successful upload

        } catch (err) {
            console.error('Upload error:', err);
            setError('root', {
                type: 'manual',
                message: err.response?.data?.message || 'Upload failed. Please try again.'
            });
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Format duration
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
                <Video size={100} />
            </div>
            <div className="absolute bottom-40 left-20 text-purple-500/10 animate-float animation-delay-1000">
                <Upload size={80} />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8 animate-slideIn">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-70 animate-pulse"></div>
                            <div className="relative bg-black rounded-lg p-2">
                                <Video size={28} className="text-purple-400" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-black">
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient">
                                Upload Video
                            </span>
                        </h1>
                    </div>
                    <p className="text-purple-300/80 flex items-center gap-2 mt-2">
                        <Sparkles size={16} className="text-yellow-400" />
                        Upload video editorial for problem #{problemId}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl overflow-hidden animate-slideIn animation-delay-200">
                    <div className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* File Upload Area */}
                            <div 
                                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                                    dragActive 
                                        ? 'border-purple-400 bg-purple-500/10' 
                                        : errors.videoFile 
                                            ? 'border-red-500/50 bg-red-500/5' 
                                            : 'border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/5'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    id="videoFile"
                                    accept="video/*"
                                    {...register('videoFile', {
                                        required: 'Please select a video file',
                                        validate: {
                                            isVideo: (files) => {
                                                if (!files || !files[0]) return 'Please select a video file';
                                                const file = files[0];
                                                return file.type.startsWith('video/') || 'Please select a valid video file';
                                            },
                                            fileSize: (files) => {
                                                if (!files || !files[0]) return true;
                                                const file = files[0];
                                                const maxSize = 100 * 1024 * 1024; // 100MB
                                                return file.size <= maxSize || 'File size must be less than 100MB';
                                            }
                                        }
                                    })}
                                    className="hidden"
                                    disabled={uploading}
                                />
                                
                                <label 
                                    htmlFor="videoFile"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <div className={`p-4 rounded-full mb-4 transition-all duration-300 ${
                                        dragActive ? 'bg-purple-500/30 scale-110' : 'bg-purple-500/10'
                                    }`}>
                                        <Upload size={40} className="text-purple-400" />
                                    </div>
                                    <p className="text-lg font-medium text-white mb-2">
                                        {dragActive ? 'Drop your video here' : 'Click to upload or drag and drop'}
                                    </p>
                                    <p className="text-sm text-purple-300/60 text-center">
                                        MP4, WebM, or MOV files (Max 100MB)
                                    </p>
                                </label>
                            </div>

                            {errors.videoFile && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-shake">
                                    <p className="text-sm text-red-400 flex items-center gap-2">
                                        <XCircle size={16} />
                                        {errors.videoFile.message}
                                    </p>
                                </div>
                            )}

                            {/* Selected File Info */}
                            {selectedFile && (
                                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg animate-slideDown">
                                    <h3 className="font-medium text-purple-300 mb-3 flex items-center gap-2">
                                        <FileText size={16} />
                                        Selected File
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Name:</span>
                                            <span className="text-sm text-white font-medium">{selectedFile.name}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Size:</span>
                                            <span className="text-sm text-white font-medium">{formatFileSize(selectedFile.size)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Type:</span>
                                            <span className="text-sm text-white font-medium">{selectedFile.type.split('/')[1].toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Upload Progress */}
                            {uploading && (
                                <div className="space-y-3 animate-fadeIn">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-purple-300 flex items-center gap-2">
                                            <Loader size={14} className="animate-spin" />
                                            Uploading...
                                        </span>
                                        <span className="text-sm font-medium text-purple-400">{uploadProgress}%</span>
                                    </div>
                                    <div className="h-2 bg-purple-500/20 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {errors.root && (
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-shake">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-red-300 mb-1">Upload Failed</h4>
                                            <p className="text-sm text-red-400/80">{errors.root.message}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {uploadedVideo && (
                                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg animate-scaleIn">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1 bg-green-500/20 rounded-full">
                                            <CheckCircle size={20} className="text-green-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-green-300 mb-2">Upload Successful!</h4>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-2 text-green-400/80">
                                                    <Clock size={14} />
                                                    <span>Duration: {formatDuration(uploadedVideo.duration)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-green-400/80">
                                                    <Calendar size={14} />
                                                    <span>Uploaded: {new Date(uploadedVideo.uploadedAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                                    <span className="relative flex items-center justify-center gap-2">
                                        {uploading ? (
                                            <>
                                                <Loader size={18} className="animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={18} />
                                                Upload Video
                                            </>
                                        )}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => reset()}
                                    disabled={uploading}
                                    className="px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-purple-300 hover:text-white hover:border-purple-400 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg animate-slideIn animation-delay-400">
                    <div className="flex items-start gap-3">
                        <Shield size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-blue-300 mb-1">Video Guidelines</h3>
                            <ul className="text-sm text-blue-300/70 space-y-1 list-disc list-inside">
                                <li>Maximum file size: 100MB</li>
                                <li>Supported formats: MP4, WebM, MOV</li>
                                <li>Recommended resolution: 1080p or higher</li>
                                <li>Keep videos concise and focused on the problem explanation</li>
                            </ul>
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
                    animation: fadeIn 0.5s ease-out forwards;
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

export default AdminUpload;

// import { useLocation, useParams } from 'react-router';
// import React, { useState , useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import axios from 'axios';
// import axiosClient from '../../Utils/axiosClient';


// function AdminUpload() {

  

//     const { problemId } = useParams();

//     const [uploading, setUploading] = useState(false);
//     const [uploadProgress, setUploadProgress] = useState(0);
//     const [uploadedVideo, setUploadedVideo] = useState(null);

//     const {
//         register,
//         handleSubmit,
//         watch,
//         formState: { errors },
//         reset,
//         setError,
//         clearErrors
//     } = useForm();

//     const selectedFile = watch('videoFile')?.[0];

//     // Upload video to Cloudinary
//     const onSubmit = async (data) => {
//         const file = data.videoFile[0];

//         setUploading(true);
//         setUploadProgress(0);
//         clearErrors();

//         try {
//             // Step 1: Get upload signature from backend
//             const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
//             const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

//             // Step 2: Create FormData for Cloudinary upload
//             const formData = new FormData();
//             formData.append('file', file);
//             formData.append('signature', signature);
//             formData.append('timestamp', timestamp);
//             formData.append('public_id', public_id);
//             formData.append('api_key', api_key);

//             // Step 3: Upload directly to Cloudinary
//             const uploadResponse = await axios.post(upload_url, formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                 },
//                 onUploadProgress: (progressEvent) => {
//                     const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//                     setUploadProgress(progress);
//                 },
//             });

//             const cloudinaryResult = uploadResponse.data;

//             // Step 4: Save video metadata to backend
//             const metadataResponse = await axiosClient.post('/video/save', {
//                 problemId: problemId,
//                 cloudinaryPublicId: cloudinaryResult.public_id,
//                 secureUrl: cloudinaryResult.secure_url,
//                 duration: cloudinaryResult.duration,
//             });

//             setUploadedVideo(metadataResponse.data.videoSolution);
//             reset(); // Reset form after successful upload

//         } catch (err) {
//             console.error('Upload error:', err);
//             setError('root', {
//                 type: 'manual',
//                 message: err.response?.data?.message || 'Upload failed. Please try again.'
//             });
//         } finally {
//             setUploading(false);
//             setUploadProgress(0);
//         }
//     };

//     // Format file size
//     const formatFileSize = (bytes) => {
//         if (bytes === 0) return '0 Bytes';
//         const k = 1024;
//         const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//         const i = Math.floor(Math.log(bytes) / Math.log(k));
//         return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//     };

//     // Format duration
//     const formatDuration = (seconds) => {
//         const mins = Math.floor(seconds / 60);
//         const secs = Math.floor(seconds % 60);
//         return `${mins}:${secs.toString().padStart(2, '0')}`;
//     };

//     return (
//         <div className="max-w-md mx-auto p-6">
//             <div className="card bg-base-100 shadow-xl">
//                 <div className="card-body">
//                     <h2 className="card-title">Upload Video</h2>

//                     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                         {/* File Input */}
//                         <div className="form-control w-full">
//                             <label className="label">
//                                 <span className="label-text">Choose video file</span>
//                             </label>
//                             <input

//                                 type="file"
//                                 accept="video/*"
//                                 {...register('videoFile', {
//                                     required: 'Please select a video file',
//                                     validate: {
//                                         isVideo: (files) => {
//                                             if (!files || !files[0]) return 'Please select a video file';
//                                             const file = files[0];
//                                             return file.type.startsWith('video/') || 'Please select a valid video file';
//                                         },
//                                         fileSize: (files) => {
//                                             if (!files || !files[0]) return true;
//                                             const file = files[0];
//                                             const maxSize = 100 * 1024 * 1024; // 100MB
//                                             return file.size <= maxSize || 'File size must be less than 100MB';
//                                         }
//                                     }
//                                 })}
//                                 className={`file-input file-input-bordered w-full ${errors.videoFile ? 'file-input-error' : ''}`}
//                                 disabled={uploading}
//                             />
//                             {errors.videoFile && (
//                                 <label className="label">
//                                     <span className="label-text-alt text-error">{errors.videoFile.message}</span>
//                                 </label>
//                             )}
//                         </div>

//                         {/* Selected File Info */}
//                         {selectedFile && (
//                             <div className="alert alert-info">
//                                 <div>
//                                     <h3 className="font-bold">Selected File:</h3>
//                                     <p className="text-sm">{selectedFile.name}</p>
//                                     <p className="text-sm">Size: {formatFileSize(selectedFile.size)}</p>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Upload Progress */}
//                         {uploading && (
//                             <div className="space-y-2">
//                                 <div className="flex justify-between text-sm">
//                                     <span>Uploading...</span>
//                                     <span>{uploadProgress}%</span>
//                                 </div>
//                                 <progress
//                                     className="progress progress-primary w-full"
//                                     value={uploadProgress}
//                                     max="100"
//                                 ></progress>
//                             </div>
//                         )}

//                         {/* Error Message */}
//                         {errors.root && (
//                             <div className="alert alert-error">
//                                 <span>{errors.root.message}</span>
//                             </div>
//                         )}

//                         {/* Success Message */}
//                         {uploadedVideo && (
//                             <div className="alert alert-success">
//                                 <div>
//                                     <h3 className="font-bold">Upload Successful!</h3>
//                                     <p className="text-sm">Duration: {formatDuration(uploadedVideo.duration)}</p>
//                                     <p className="text-sm">Uploaded: {new Date(uploadedVideo.uploadedAt).toLocaleString()}</p>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Upload Button */}
//                         <div className="card-actions justify-end">
//                             <button
//                                 type="submit"
//                                 disabled={uploading}
//                                 className={`btn btn-primary ${uploading ? 'loading' : ''}`}
//                             >
//                                 {uploading ? 'Uploading...' : 'Upload Video'}
//                             </button>
//                         </div>
//                     </form>

//                 </div>
//             </div>
//         </div>
//     );
// }


// export default AdminUpload;