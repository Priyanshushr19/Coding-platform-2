import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from "../Utils/axiosClient"
import SubmissionHistory from "../components/Editor/SubmissionHistory"
import ChatAi from '../components/Editor/ChatAi';
import Editorial from '../components/Editor/Editorial';
import {
  setCurrentProblem,
  updateCode,
  setSelectedLanguage,
  setActiveLeftTab,
  setActiveRightTab
} from '../slices/currentProblemSlice';
import ProblemDiscussion from '../components/Editor/ProblemDiscussion';
import { 
  Play, Send, ChevronLeft, ChevronRight, 
  Code2, FileText, Video, Users, MessageSquare,
  Sparkles, Zap, Award, Clock, Cpu, HardDrive,
  CheckCircle, XCircle, AlertCircle, Loader,
  Terminal
} from 'lucide-react';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const ProblemPage = () => {
  const dispatch = useDispatch();
  const { problem, code, selectedLanguage, activeLeftTab, activeRightTab } = useSelector((state) => state.currentProblem);

  const [loading, setLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [hoveredTab, setHoveredTab] = useState(null);
  const editorRef = useRef(null);
  let { problemId } = useParams();
  const abortControllerRef = useRef(null);

  const { handleSubmit } = useForm();

  useEffect(() => {
  const fetchProblem = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);

    try {
      const response = await axiosClient.get(
        `/problem/problemById/${problemId}`,
        {
          signal: abortControllerRef.current.signal
        }
      );

      const startCode = response.data.startCode || [];

      const initialCodeObj = startCode.find(
        (sc) => sc.language === selectedLanguage
      );

      const initialCode =
        initialCodeObj?.initialCode || "// Start coding here";

      dispatch(
        setCurrentProblem({
          problem: response.data,
          code: initialCode
        })
      );

    } catch (error) {
      if (
        error.name !== "CanceledError" &&
        error.name !== "AbortError"
      ) {
        console.error("Error fetching problem:", error);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  };

  if (problemId) {
    fetchProblem();
  }

  return () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

}, [problemId, dispatch]);

  const handleEditorChange = (value) => {
    dispatch(updateCode(value || ''));
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    dispatch(setSelectedLanguage(language));
  };

  const handleLeftTabChange = (tab) => {
    dispatch(setActiveLeftTab(tab));
  };

  const handleRightTabChange = (tab) => {
    dispatch(setActiveRightTab(tab));
  };

  const handleRun = async () => {
    if (!code.trim()) {
      setRunResult({
        success: false,
        error: 'Code cannot be empty'
      });
      handleRightTabChange('testcase');
      return;
    }

    if (runLoading || submitLoading) {
      return;
    }

    setRunLoading(true);
    setRunResult(null);

    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      handleRightTabChange('testcase');
    } catch (error) {
      console.error('Error running code:', error);
      const errorMessage = error.message || error.response?.data?.message || error.response?.data?.error || 'Failed to run code. Please try again.';
      setRunResult({
        success: false,
        error: errorMessage,
        networkError: error.networkError || false
      });
      handleRightTabChange('testcase');
    } finally {
      setRunLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      setSubmitResult({
        accepted: false,
        error: 'Code cannot be empty'
      });
      handleRightTabChange('result');
      return;
    }

    if (submitLoading || runLoading) {
      return;
    }

    setSubmitLoading(true);
    setSubmitResult(null);

    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });

      setSubmitResult(response.data);
      handleRightTabChange('result');
    } catch (error) {
      console.error('Error submitting code:', error);
      const errorMessage = error.message || error.response?.data?.message || error.response?.data?.error || 'Submission failed. Please try again.';
      const responseData = error.response?.data || {};
      
      setSubmitResult({
        accepted: false,
        success: false,
        error: errorMessage,
        errorMessage: responseData.errorMessage || errorMessage,
        networkError: error.networkError || false,
        ...(responseData.passedTestCases !== undefined && {
          passedTestCases: responseData.passedTestCases,
          totalTestCases: responseData.totalTestCases
        })
      });
      handleRightTabChange('result');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'hard': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const leftTabs = [
    { id: 'description', label: 'Description', icon: FileText },
    { id: 'editorial', label: 'Editorial', icon: Video },
    { id: 'solutions', label: 'Solutions', icon: Code2 },
    { id: 'submissions', label: 'Submissions', icon: Award },
    { id: 'chatAI', label: 'ChatAI', icon: Sparkles },
    { id: 'discussion', label: 'Discussion', icon: MessageSquare }
  ];

  const rightTabs = [
    { id: 'code', label: 'Code', icon: Code2 },
    { id: 'testcase', label: 'Testcase', icon: Play },
    { id: 'result', label: 'Result', icon: Award }
  ];

  if (loading && !problem) {
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
              <Code2 size={32} className="text-purple-400 animate-pulse" />
            </div>
          </div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-xl font-bold animate-pulse">
            Loading problem...
          </p>
        </div>
      </div>
    );
  }

  if (!problem && !loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-8 text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Problem not found</h2>
          <p className="text-red-300">The problem you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-black text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(128, 0, 128, 0.1) 1px, transparent 0)',
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* Gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full filter blur-[128px] animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/20 rounded-full filter blur-[128px] animate-pulse animation-delay-2000"></div>

      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r border-purple-500/30 relative z-10 backdrop-blur-sm bg-black/40">
        {/* Left Tabs */}
        <div className="flex border-b border-purple-500/30 bg-black/50 px-2">
          {leftTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeLeftTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`group relative flex items-center gap-2 px-4 py-3 transition-all duration-300 overflow-hidden ${
                  isActive 
                    ? 'text-purple-400 border-b-2 border-purple-400' 
                    : 'text-gray-400 hover:text-purple-300'
                }`}
                onClick={() => handleLeftTabChange(tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                <Icon size={16} className={`transition-transform ${hoveredTab === tab.id ? 'scale-110' : ''}`} />
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.id === 'chatAI' && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Problem Header */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full text-xs border border-purple-500/30">
                      {problem.tags}
                    </span>
                  </div>

                  {/* Problem Stats */}
                  <div className="flex gap-4 text-sm text-gray-400 border-b border-purple-500/30 pb-4">
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-purple-400" />
                      <span>Time Limit: 1s</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HardDrive size={14} className="text-purple-400" />
                      <span>Memory: 256MB</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="prose max-w-none">
                    <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                      {problem.description}
                    </div>
                  </div>

                  {/* Examples */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                      <Play size={16} className="text-purple-400" />
                      Examples
                    </h3>
                    <div className="space-y-4">
                      {(problem.visibleTestCases || []).map((example, index) => (
                        <div 
                          key={index} 
                          className="group bg-black/50 border border-purple-500/30 p-4 rounded-xl hover:border-purple-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(128,0,128,0.2)]"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-purple-300 font-medium">Example {index + 1}</span>
                            {index === 0 && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                                Sample
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 text-sm font-mono">
                            <div className="bg-black/70 p-2 rounded-lg border border-purple-500/20">
                              <span className="text-purple-300">Input: </span>
                              <span className="text-gray-300">{example.input}</span>
                            </div>
                            <div className="bg-black/70 p-2 rounded-lg border border-purple-500/20">
                              <span className="text-purple-300">Output: </span>
                              <span className="text-gray-300">{example.output}</span>
                            </div>
                            {example.explanation && (
                              <div className="bg-black/70 p-2 rounded-lg border border-purple-500/20">
                                <span className="text-purple-300">Explanation: </span>
                                <span className="text-gray-300">{example.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Video size={20} className="text-purple-400" />
                      Editorial Explanation
                    </h2>
                    <span className="badge bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 animate-pulse">
                      🎥 Video Guide
                    </span>
                  </div>

                  <div className="bg-black/50 border border-purple-500/30 rounded-2xl p-4">
                    <div className="rounded-xl overflow-hidden border border-purple-500/30">
                      <Editorial
                        secureUrl={problem?.secureUrl}
                        thumbnailUrl={problem?.thumbnailUrl}
                        duration={problem?.duration}
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                    <p className="text-sm text-purple-300 leading-relaxed">
                      This editorial provides a complete walkthrough of the problem,
                      explaining the approach, logic, and optimization techniques step-by-step.
                      Watch the video to deeply understand the solution strategy.
                    </p>
                  </div>

                  {!problem?.secureUrl && (
                    <div className="flex flex-col items-center justify-center bg-black/50 border border-purple-500/30 rounded-xl p-12 text-purple-400">
                      <Video size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">Editorial coming soon!</p>
                      <p className="text-sm text-purple-300/70 mt-2">We're working on creating a detailed video explanation for this problem.</p>
                    </div>
                  )}
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Code2 size={20} className="text-purple-400" />
                    Solutions
                  </h2>
                  
                  <div className="space-y-6">
                    {(problem.referenceSolution || []).map((solution, index) => (
                      <div 
                        key={index} 
                        className="group border border-purple-500/30 rounded-xl bg-black/50 overflow-hidden hover:border-purple-400 transition-all duration-300 hover:shadow-[0_0_20px_rgba(128,0,128,0.2)]"
                      >
                        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-4 py-3 border-b border-purple-500/30">
                          <h3 className="font-semibold text-purple-300 flex items-center gap-2">
                            <Zap size={16} className="text-yellow-400" />
                            {problem?.title} - {solution?.language}
                          </h3>
                        </div>
                        <div className="p-4">
                          <pre className="bg-black/70 p-4 rounded-lg text-sm overflow-x-auto text-gray-300 border border-purple-500/20 font-mono">
                            <code>{solution?.completeCode}</code>
                          </pre>
                        </div>
                      </div>
                    ))}
                    
                    {(!problem.referenceSolution || problem.referenceSolution.length === 0) && (
                      <div className="flex flex-col items-center justify-center bg-black/50 border border-purple-500/30 rounded-xl p-12 text-purple-400">
                        <Award size={48} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium">Solutions will be available after you solve the problem.</p>
                        <p className="text-sm text-purple-300/70 mt-2">Keep coding! You're doing great.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div className="space-y-4 animate-fadeIn">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Award size={20} className="text-purple-400" />
                    My Submissions
                  </h2>
                  <div className="bg-black/50 border border-purple-500/30 rounded-xl p-4">
                    <SubmissionHistory problemId={problemId} />
                  </div>
                </div>
              )}

              {activeLeftTab === 'chatAI' && (
                <div className="space-y-4 animate-fadeIn">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-yellow-400" />
                    Chat with AI Assistant
                  </h2>
                  <div className="bg-black/50 border border-purple-500/30 rounded-xl p-4 min-h-[500px]">
                    <ChatAi problem={problem} />
                  </div>
                </div>
              )}

              {activeLeftTab === 'discussion' && (
                <div className="space-y-4 animate-fadeIn">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <MessageSquare size={20} className="text-purple-400" />
                    Discussion
                  </h2>
                  <div className="bg-black/50 border border-purple-500/30 rounded-xl p-4">
                    <ProblemDiscussion />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col relative z-10 backdrop-blur-sm bg-black/40">
        {/* Right Tabs */}
        <div className="flex border-b border-purple-500/30 bg-black/50 px-2">
          {rightTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeRightTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`group relative flex items-center gap-2 px-4 py-3 transition-all duration-300 overflow-hidden ${
                  isActive 
                    ? 'text-purple-400 border-b-2 border-purple-400' 
                    : 'text-gray-400 hover:text-purple-300'
                }`}
                onClick={() => handleRightTabChange(tab.id)}
                onMouseEnter={() => setHoveredTab(`right-${tab.id}`)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                <Icon size={16} className={`transition-transform ${hoveredTab === `right-${tab.id}` ? 'scale-110' : ''}`} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              {/* Language Selector */}
              <div className="flex items-center gap-2 p-4 border-b border-purple-500/30 bg-black/30">
                <span className="text-sm text-purple-300 mr-2">Language:</span>
                {['javascript', 'java', 'cpp'].map((lang) => (
                  <button
                    key={lang}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedLanguage === lang 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg shadow-purple-500/20' 
                        : 'bg-black/50 text-gray-400 border border-purple-500/30 hover:border-purple-400 hover:text-white'
                    }`}
                    onClick={() => handleLanguageChange(lang)}
                  >
                    {langMap[lang] || lang}
                  </button>
                ))}
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 border-b border-purple-500/30">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                    fontFamily: 'Fira Code, monospace',
                    fontLigatures: true,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-purple-500/30 bg-black/30 flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1.5 bg-black/50 border border-purple-500/30 rounded-lg text-gray-400 hover:text-white hover:border-purple-400 transition-all"
                    onClick={() => handleRightTabChange('testcase')}
                  >
                    <Terminal size={16} className="inline mr-1" />
                    Console
                  </button>
                </div>
                
                <div className="flex gap-3">
                  <button
                    className={`group relative px-4 py-1.5 rounded-lg font-medium overflow-hidden transition-all duration-300 ${
                      runLoading 
                        ? 'bg-yellow-500/20 text-yellow-400 cursor-not-allowed' 
                        : 'bg-black/50 border border-purple-500/30 text-purple-300 hover:border-purple-400 hover:text-white'
                    }`}
                    onClick={handleRun}
                    disabled={runLoading || submitLoading}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    <span className="relative flex items-center gap-2">
                      {runLoading ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          Run
                        </>
                      )}
                    </span>
                  </button>
                  
                  <button
                    className={`group relative px-4 py-1.5 rounded-lg font-medium overflow-hidden transition-all duration-300 ${
                      submitLoading 
                        ? 'bg-purple-500/20 text-purple-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-600 to-purple-400 text-white hover:from-purple-500 hover:to-purple-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(128,0,128,0.3)]'
                    }`}
                    onClick={handleSubmitCode}
                    disabled={submitLoading || runLoading}
                  >
                    <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    <span className="relative flex items-center gap-2">
                      {submitLoading ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Submit
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
              <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <Play size={16} className="text-purple-400" />
                Test Results
              </h3>
              
              {runResult ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className={`p-4 rounded-xl border ${
                    runResult.success 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {runResult.success ? (
                        <>
                          <CheckCircle size={20} className="text-green-400" />
                          <span className="font-bold text-green-400">All test cases passed!</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={20} className="text-red-400" />
                          <span className="font-bold text-red-400">{runResult.error || 'Test cases failed'}</span>
                        </>
                      )}
                    </div>
                    
                    {runResult.success && (
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-400">Runtime: <span className="text-green-400">{runResult.runtime || 'N/A'} sec</span></span>
                        <span className="text-gray-400">Memory: <span className="text-green-400">{runResult.memory || 'N/A'} KB</span></span>
                      </div>
                    )}

                    {/* Test Cases */}
                    <div className="mt-4 space-y-3">
                      {(runResult.testCases || []).map((tc, i) => (
                        <div 
                          key={i} 
                          className="bg-black/50 border border-purple-500/30 p-3 rounded-lg hover:border-purple-400 transition-all"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-purple-300">Test Case {i + 1}</span>
                            {tc.status_id === 3 ? (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">✓ Passed</span>
                            ) : (
                              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">✗ Failed</span>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                            <div className="bg-black/70 p-2 rounded">
                              <span className="text-purple-300">Input:</span>
                              <span className="text-gray-300 block truncate">{tc.stdin}</span>
                            </div>
                            <div className="bg-black/70 p-2 rounded">
                              <span className="text-purple-300">Expected:</span>
                              <span className="text-gray-300 block truncate">{tc.expected_output}</span>
                            </div>
                            <div className="bg-black/70 p-2 rounded">
                              <span className="text-purple-300">Output:</span>
                              <span className="text-gray-300 block truncate">{tc.stdout}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Play size={48} className="text-purple-400 mb-4 opacity-50" />
                  <p className="text-purple-300 text-lg">No test results yet</p>
                  <p className="text-purple-400/60 text-sm mt-2">Click "Run" to test your code with the example test cases.</p>
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
              <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <Award size={16} className="text-purple-400" />
                Submission Result
              </h3>
              
              {submitResult ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className={`p-6 rounded-xl border ${
                    submitResult.accepted 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      {submitResult.accepted ? (
                        <>
                          <div className="p-2 bg-green-500/20 rounded-full">
                            <CheckCircle size={32} className="text-green-400" />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-green-400">Accepted!</h4>
                            <p className="text-green-300/70">Great job! Your solution passed all test cases.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-2 bg-red-500/20 rounded-full">
                            <XCircle size={32} className="text-red-400" />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-red-400">Wrong Answer</h4>
                            <p className="text-red-300/70">{submitResult.error || 'Your solution did not pass all test cases.'}</p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-black/50 border border-purple-500/30 rounded-lg p-3">
                        <span className="text-sm text-purple-300">Test Cases Passed</span>
                        <p className="text-xl font-bold text-white">
                          {submitResult.passedTestCases || 0}/{submitResult.totalTestCases || 0}
                        </p>
                      </div>
                      <div className="bg-black/50 border border-purple-500/30 rounded-lg p-3">
                        <span className="text-sm text-purple-300">Runtime</span>
                        <p className="text-xl font-bold text-white">{submitResult.runtime || 'N/A'} sec</p>
                      </div>
                      <div className="bg-black/50 border border-purple-500/30 rounded-lg p-3">
                        <span className="text-sm text-purple-300">Memory</span>
                        <p className="text-xl font-bold text-white">{submitResult.memory || 'N/A'} KB</p>
                      </div>
                      <div className="bg-black/50 border border-purple-500/30 rounded-lg p-3">
                        <span className="text-sm text-purple-300">Status</span>
                        <p className={`text-xl font-bold ${submitResult.accepted ? 'text-green-400' : 'text-red-400'}`}>
                          {submitResult.accepted ? 'Passed' : 'Failed'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Send size={48} className="text-purple-400 mb-4 opacity-50" />
                  <p className="text-purple-300 text-lg">No submission yet</p>
                  <p className="text-purple-400/60 text-sm mt-2">Click "Submit" to submit your solution for evaluation.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(128, 0, 128, 0.3);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 0, 128, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ProblemPage;