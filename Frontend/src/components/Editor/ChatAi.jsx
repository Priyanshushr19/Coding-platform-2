// import { useState, useRef, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import axiosClient from "../../Utils/axiosClient";
// import { Send, Sparkles, Bot, User, Loader } from 'lucide-react';

// function ChatAi({ problem }) {
//     const [messages, setMessages] = useState([
//         { role: 'model', parts: [{ text: "Hello! I'm here to help you with this coding problem. Ask me anything about the problem, approach, or code!" }] }
//     ]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [hoveredMessage, setHoveredMessage] = useState(null);

//     const { register, handleSubmit, reset, formState: { errors } } = useForm();
//     const messagesEndRef = useRef(null);

//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [messages]);

//     const onSubmit = async (data) => {
//         if (!data.message.trim()) return;

//         const userMessage = { role: 'user', parts: [{ text: data.message.trim() }] };
//         setMessages(prev => [...prev, userMessage]);
//         reset();
//         setIsLoading(true);

//         try {
//             // Prepare the messages for the API - include the new user message
//             const apiMessages = [...messages, userMessage];
            
//             const response = await axiosClient.post("/ai/chat", {
//                 messages: apiMessages,
//                 title: problem?.title || "",
//                 description: problem?.description || "",
//                 testCases: problem?.visibleTestCases || [],
//                 startCode: problem?.startCode || []
//             });

//             setMessages(prev => [...prev, { 
//                 role: 'model', 
//                 parts: [{ text: response.data.message || response.data.text || "I'm not sure how to respond to that." }] 
//             }]);
//         } catch (error) {
//             console.error("API Error:", error);
//             setMessages(prev => [...prev, { 
//                 role: 'model', 
//                 parts: [{ text: "Sorry, I'm having trouble responding right now. Please try again later." }] 
//             }]);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="flex flex-col h-full max-h-[80vh] min-h-[500px] bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl overflow-hidden">
//             {/* Chat Header */}
//             <div className="sticky top-0 p-4 bg-gradient-to-r from-purple-900/30 to-purple-800/20 border-b border-purple-500/30 flex items-center gap-2">
//                 <div className="relative">
//                     <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-70 animate-pulse"></div>
//                     <div className="relative bg-black rounded-full p-1.5">
//                         <Bot size={20} className="text-purple-400" />
//                     </div>
//                 </div>
//                 <div>
//                     <h3 className="font-semibold text-white flex items-center gap-2">
//                         AI Assistant
//                         <Sparkles size={14} className="text-yellow-400" />
//                     </h3>
//                     <p className="text-xs text-purple-300/70">Ask me anything about the problem</p>
//                 </div>
//             </div>

//             {/* Messages Container */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
//                 {messages.map((msg, index) => (
//                     <div 
//                         key={index} 
//                         className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slideIn`}
//                         style={{ animationDelay: `${index * 50}ms` }}
//                         onMouseEnter={() => setHoveredMessage(index)}
//                         onMouseLeave={() => setHoveredMessage(null)}
//                     >
//                         <div className={`flex max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-2`}>
//                             {/* Avatar */}
//                             <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
//                                 msg.role === "user" 
//                                     ? "bg-gradient-to-r from-purple-600 to-pink-600" 
//                                     : "bg-gradient-to-r from-blue-600 to-purple-600"
//                             }`}>
//                                 {msg.role === "user" ? (
//                                     <User size={16} className="text-white" />
//                                 ) : (
//                                     <Bot size={16} className="text-white" />
//                                 )}
//                             </div>

//                             {/* Message Bubble */}
//                             <div 
//                                 className={`relative group rounded-2xl px-4 py-2 ${
//                                     msg.role === "user" 
//                                         ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-none" 
//                                         : "bg-black/50 border border-purple-500/30 text-gray-200 rounded-tl-none hover:border-purple-400"
//                                 } transition-all duration-300`}
//                             >
//                                 <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
                                
//                                 {/* Hover indicator */}
//                                 {hoveredMessage === index && (
//                                     <span className="absolute -bottom-1 right-2 flex gap-1">
//                                         <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></span>
//                                         <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse animation-delay-200"></span>
//                                         <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse animation-delay-400"></span>
//                                     </span>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 ))}
                
//                 {/* Loading Indicator */}
//                 {isLoading && (
//                     <div className="flex justify-start animate-slideIn">
//                         <div className="flex flex-row items-start gap-2">
//                             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
//                                 <Bot size={16} className="text-white" />
//                             </div>
//                             <div className="bg-black/50 border border-purple-500/30 rounded-2xl rounded-tl-none px-4 py-3">
//                                 <div className="flex gap-1">
//                                     <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
//                                     <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-200"></div>
//                                     <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-400"></div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}
                
//                 <div ref={messagesEndRef} />
//             </div>

//             {/* Input Form */}
//             <form 
//                 onSubmit={handleSubmit(onSubmit)} 
//                 className="sticky bottom-0 p-4 bg-black/50 border-t border-purple-500/30 backdrop-blur-md"
//             >
//                 <div className="flex items-center gap-2">
//                     <div className="relative flex-1 group">
//                         <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
//                         <input 
//                             placeholder="Ask me anything about the problem..." 
//                             className="relative w-full px-4 py-3 bg-black/50 border-2 border-purple-500/30 rounded-lg text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all disabled:opacity-50" 
//                             {...register("message", { 
//                                 required: "Message is required", 
//                                 minLength: {
//                                     value: 1,
//                                     message: "Message cannot be empty"
//                                 },
//                                 validate: {
//                                     notEmpty: value => value.trim().length > 0 || "Message cannot be empty"
//                                 }
//                             })}
//                             disabled={isLoading}
//                         />
//                     </div>
                    
//                     <button 
//                         type="submit" 
//                         className={`group relative p-3 rounded-lg transition-all duration-300 overflow-hidden ${
//                             errors.message || isLoading
//                                 ? 'bg-gray-700 cursor-not-allowed'
//                                 : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]'
//                         }`}
//                         disabled={!!errors.message || isLoading}
//                     >
//                         <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
//                         <span className="relative flex items-center justify-center">
//                             {isLoading ? (
//                                 <Loader size={18} className="animate-spin text-white" />
//                             ) : (
//                                 <Send size={18} className="text-white" />
//                             )}
//                         </span>
//                     </button>
//                 </div>
                
//                 {/* Error Message */}
//                 {errors.message && (
//                     <div className="mt-2 text-xs text-red-400 flex items-center gap-1 animate-shake">
//                         <span className="w-1 h-1 bg-red-400 rounded-full"></span>
//                         {errors.message.message}
//                     </div>
//                 )}

//                 {/* Typing indicator (when not loading but input focused) */}
//                 {!isLoading && (
//                     <p className="text-xs text-purple-300/50 mt-2 text-center">
//                         Press Enter to send • AI may make mistakes
//                     </p>
//                 )}
//             </form>

//             {/* Custom CSS for animations */}
//             <style jsx>{`
//                 @keyframes slideIn {
//                     from {
//                         opacity: 0;
//                         transform: translateY(10px);
//                     }
//                     to {
//                         opacity: 1;
//                         transform: translateY(0);
//                     }
//                 }
                
//                 @keyframes shake {
//                     0%, 100% { transform: translateX(0); }
//                     10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
//                     20%, 40%, 60%, 80% { transform: translateX(2px); }
//                 }
                
//                 .animate-slideIn {
//                     animation: slideIn 0.3s ease-out forwards;
//                 }
                
//                 .animate-shake {
//                     animation: shake 0.3s ease-in-out;
//                 }
                
//                 .animation-delay-200 {
//                     animation-delay: 200ms;
//                 }
                
//                 .animation-delay-400 {
//                     animation-delay: 400ms;
//                 }
                
//                 .scrollbar-thin::-webkit-scrollbar {
//                     width: 6px;
//                 }
                
//                 .scrollbar-thin::-webkit-scrollbar-track {
//                     background: transparent;
//                 }
                
//                 .scrollbar-thin::-webkit-scrollbar-thumb {
//                     background: rgba(128, 0, 128, 0.3);
//                     border-radius: 3px;
//                 }
                
//                 .scrollbar-thin::-webkit-scrollbar-thumb:hover {
//                     background: rgba(128, 0, 128, 0.5);
//                 }
//             `}</style>
//         </div>
//     );
// }

// export default ChatAi;


import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../../Utils/axiosClient";
import { Send } from 'lucide-react';

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Hello! I'm here to help you with this coding problem. Ask me anything about the problem, approach, or code!" }] }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        if (!data.message.trim()) return;

        const userMessage = { role: 'user', parts: [{ text: data.message.trim() }] };
        setMessages(prev => [...prev, userMessage]);
        reset();
        setIsLoading(true);

        try {
            // Prepare the messages for the API - include the new user message
            const apiMessages = [...messages, userMessage];
            
            const response = await axiosClient.post("/ai/chat", {
                messages: apiMessages,
                title: problem?.title || "",
                description: problem?.description || "",
                testCases: problem?.visibleTestCases || [],
                startCode: problem?.startCode || []
            });

            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: response.data.message || response.data.text || "I'm not sure how to respond to that." }] 
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: "Sorry, I'm having trouble responding right now. Please try again later." }] 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[80vh] min-h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                    >
                        <div className={`chat-bubble ${msg.role === "user" ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"}`}>
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="chat chat-start">
                        <div className="chat-bubble bg-base-200 text-base-content">
                            <span className="loading loading-dots loading-sm"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="sticky bottom-0 p-4 bg-base-100 border-t"
            >
                <div className="flex items-center">
                    <input 
                        placeholder="Ask me anything about the problem..." 
                        className="input input-bordered flex-1" 
                        {...register("message", { 
                            required: "Message is required", 
                            minLength: {
                                value: 1,
                                message: "Message cannot be empty"
                            },
                            validate: {
                                notEmpty: value => value.trim().length > 0 || "Message cannot be empty"
                            }
                        })}
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        className="btn btn-ghost ml-2"
                        disabled={!!errors.message || isLoading}
                    >
                        {isLoading ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>
                {errors.message && (
                    <p className="text-error text-xs mt-1 ml-1">{errors.message.message}</p>
                )}
            </form>
        </div>
    );
}

export default ChatAi;