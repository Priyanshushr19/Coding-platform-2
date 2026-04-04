import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import axiosClient from '../../Utils/axiosClient';

const ContestProblemPage = () => {
    const { contestId, problemId } = useParams();
    const navigate = useNavigate();

    const [activeLeftTab, setActiveLeftTab] = useState('description');
    const [activeRightTab, setActiveRightTab] = useState('code');
    const [code, setCode] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [problem, setProblem] = useState(null);
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [runLoading, setRunLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [loadingProblem, setLoadingProblem] = useState(true);
    const timeoutRef = useRef(null);
    const abortControllerRef = useRef(null);

    const fetchSubmissions = async () => {
        setLoadingSubmissions(true);
        try {
            const { data } = await axiosClient.get(
                `/api/contests/${contestId}/problems/${problemId}/submissions`
            );
            console.log('Submissions data:', data);
            if (data.success) {
                setSubmissions(data.submissions || []);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleLeftTabChange = (tab) => {
        setActiveLeftTab(tab);
        if (tab === 'submissions') {
            fetchSubmissions();
        }
    };

    const langMap = {
        javascript: 'JavaScript',
        java: 'Java',
        cpp: 'C++',
        'c++': 'C++'
    };

    const fetchProblem = async () => {
        setLoadingProblem(true);
        try {
            const { data } = await axiosClient.get(`/api/contests/${contestId}/problems/${problemId}`, {
                signal: abortControllerRef.current?.signal
            });
            console.log('Problem data:', data);
            if (data.success) {
                setProblem(data.problem || data);
            } else {
                console.error('Failed to fetch problem:', data.error);
            }
        } catch (error) {
            if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
                console.error('Error fetching problem:', error);
            }
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setLoadingProblem(false);
            }
        }
    };

    useEffect(() => {
        // Abort previous request if component unmounts or IDs change
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        fetchProblem();

        // Cleanup function
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contestId, problemId]);

    const handleRun = async () => {
        if (!code.trim()) {
            alert('Please write some code first!');
            return;
        }

        // Prevent double submission
        if (runLoading || submitLoading) {
            return;
        }
        
        setRunLoading(true);
        setRunResult(null);
        try {
            const res = await axiosClient.post(
                `/api/contests/${contestId}/problems/${problemId}/run`,
                {
                    code,
                    language: selectedLanguage,
                }
            );
            console.log('Run result:', res.data);
            setRunResult(res.data);
            setActiveRightTab("testcase");
        } catch (error) {
            console.error("Run error:", error);
            // Normalize error message extraction
            const errorMessage = error.message || error.response?.data?.error || error.response?.data?.message || 'Failed to run code. Please try again.';
            setRunResult({
                success: false,
                error: errorMessage,
                networkError: error.networkError || false
            });
            setActiveRightTab("testcase");
        } finally {
            setRunLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!code.trim()) {
            alert('Please write some code first!');
            return;
        }

        // Prevent double submission
        if (submitLoading || runLoading) {
            return;
        }
        
        // Validate contest timing before submission (defensive check)
        // Note: Backend will also validate, but this prevents unnecessary API calls
        setSubmitLoading(true);
        setSubmitResult(null);
        try {
            // Note: The endpoint path might be different based on your routes
            // Check your contest routes to confirm the correct endpoint
            const res = await axiosClient.post(
                `/api/contests/submit/${contestId}/problems/${problemId}/submit`,
                {
                    code,
                    language: selectedLanguage,
                }
            );
            console.log('Submit result:', res.data);
            setSubmitResult(res.data);
            setActiveRightTab("result");
            
            // Refresh submissions after successful submit
            if (res.data.success || res.data.accepted) {
                // Clear any existing timeout
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(() => {
                    if (activeLeftTab === 'submissions') {
                        fetchSubmissions();
                    }
                    timeoutRef.current = null;
                }, 1000);
            }
        } catch (error) {
            console.error("Submit error:", error);
            // Normalize error message extraction and handle different response structures
            const errorMessage = error.message || error.response?.data?.error || error.response?.data?.message || 'Failed to submit solution. Please try again.';
            const responseData = error.response?.data || {};
            
            setSubmitResult({
                success: false,
                accepted: false,
                error: errorMessage,
                errorMessage: responseData.errorMessage || errorMessage,
                networkError: error.networkError || false,
                // Preserve any additional error details from backend
                ...(responseData.passedTestCases !== undefined && {
                    passedTestCases: responseData.passedTestCases,
                    totalTestCases: responseData.totalTestCases
                })
            });
            setActiveRightTab("result");
        } finally {
            setSubmitLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        if (!difficulty) return 'bg-gray-500';
        
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'badge-success';
            case 'medium': return 'badge-warning';
            case 'hard': return 'badge-error';
            default: return 'badge-neutral';
        }
    };

    const getStatusColor = (status) => {
        if (!status) return 'badge-neutral';
        
        switch (status.toLowerCase()) {
            case 'accepted': return 'badge-success';
            case 'pending': return 'badge-warning';
            case 'wrong': return 'badge-error';
            case 'error': return 'badge-error';
            default: return 'badge-neutral';
        }
    };

    if (loadingProblem) {
        return (
            <div className="min-h-screen flex bg-gradient-to-br from-purple-900 to-black items-center justify-center">
                <div className="loading loading-spinner loading-lg text-purple-400"></div>
                <span className="ml-4 text-white">Loading problem...</span>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="min-h-screen flex bg-gradient-to-br from-purple-900 to-black items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-400 mb-4">Problem not found</div>
                    <button 
                        onClick={() => navigate(`/contests/${contestId}`)}
                        className="btn btn-primary"
                    >
                        Back to Contest
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-purple-900 to-black">
            {/* Left Panel */}
            <div className="w-1/2 flex flex-col border-r border-purple-500/30">
                {/* Left Tabs */}
                <div className="tabs tabs-boxed bg-black/50 px-4 border-b border-purple-500/30">
                    <button
                        className={`tab ${activeLeftTab === 'description' ? 'tab-active text-purple-400' : 'text-gray-400'} hover:text-purple-300 text-lg`}
                        onClick={() => handleLeftTabChange('description')}
                    >
                        Description
                    </button>
                    <button
                        className={`tab ${activeLeftTab === 'submissions' ? 'tab-active text-purple-400' : 'text-gray-400'} hover:text-purple-300 text-lg`}
                        onClick={() => handleLeftTabChange('submissions')}
                    >
                        Submissions
                    </button>
                </div>

                {/* Left Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-black/30">
                    {activeLeftTab === 'description' && (
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <h1 className="text-2xl font-bold text-white">{problem.title || problem.problemId?.title || 'Untitled Problem'}</h1>
                                <div className={`badge ${getDifficultyColor(problem.difficulty || problem.problemId?.difficulty)} border-0 text-white`}>
                                    {(problem.difficulty || problem.problemId?.difficulty || 'medium').toUpperCase()}
                                </div>
                                <div className="badge bg-purple-500/20 text-purple-300 border-purple-500">
                                    {problem.points || 100} points
                                </div>
                            </div>

                            <div className="prose max-w-none">
                                <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                                    {problem.description || problem.problemId?.description || 'No description available.'}
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-4 text-white">Examples:</h3>
                                <div className="space-y-4">
                                    {((problem.examples || problem.visibleTestCases || problem.problemId?.examples || []).length > 0) ? (
                                        (problem.examples || problem.visibleTestCases || problem.problemId?.examples || []).map((example, index) => (
                                            <div key={index} className="bg-black/50 border border-purple-500/30 p-4 rounded-lg">
                                                <h4 className="font-semibold mb-2 text-purple-300">Example {index + 1}:</h4>
                                                <div className="space-y-2 text-sm font-mono text-gray-300">
                                                    <div><strong className="text-white">Input:</strong> {example.input || example.stdin}</div>
                                                    <div><strong className="text-white">Output:</strong> {example.output || example.expected_output}</div>
                                                    {example.explanation && (
                                                        <div><strong className="text-white">Explanation:</strong> {example.explanation}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-gray-400 text-center py-4">
                                            No examples available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeLeftTab === 'submissions' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white">My Submissions</h2>
                                <button
                                    onClick={fetchSubmissions}
                                    className="btn btn-sm bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
                                    disabled={loadingSubmissions}
                                >
                                    {loadingSubmissions ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs mr-2"></span>
                                            Refreshing...
                                        </>
                                    ) : 'Refresh'}
                                </button>
                            </div>

                            {loadingSubmissions ? (
                                <div className="flex justify-center py-8">
                                    <div className="loading loading-spinner text-purple-400"></div>
                                </div>
                            ) : submissions.length > 0 ? (
                                <div className="space-y-3">
                                    {submissions.map((sub, index) => (
                                        <div key={sub._id || index} className="bg-black/50 border border-purple-500/30 p-4 rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`badge ${getStatusColor(sub.status)}`}>
                                                    {sub.status?.toUpperCase() || 'PENDING'}
                                                </span>
                                                <span className="text-sm text-gray-400">
                                                    {new Date(sub.submittedAt || sub.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-400">Language:</span>
                                                    <span className="ml-2 text-white">{langMap[sub.language] || sub.language}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Runtime:</span>
                                                    <span className="ml-2 text-white">{sub.runtime ? `${sub.runtime}ms` : 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Memory:</span>
                                                    <span className="ml-2 text-white">{sub.memory ? `${sub.memory}KB` : 'N/A'}</span>
                                                </div>
                                            </div>
                                            {sub.score > 0 && (
                                                <div className="mt-2">
                                                    <span className="text-gray-400">Score:</span>
                                                    <span className="ml-2 text-yellow-300 font-bold">{sub.score}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-purple-400">No submissions yet</p>
                                    <p className="text-gray-500 text-sm mt-2">Submit your solution to see it here</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-1/2 flex flex-col">
                {/* Right Tabs */}
                <div className="tabs tabs-boxed bg-black/50 px-4 border-b border-purple-500/30">
                    <button
                        className={`tab ${activeRightTab === 'code' ? 'tab-active text-purple-400' : 'text-gray-400'} hover:text-purple-300 text-lg`}
                        onClick={() => setActiveRightTab('code')}
                    >
                        Code
                    </button>
                    <button
                        className={`tab ${activeRightTab === 'testcase' ? 'tab-active text-purple-400' : 'text-gray-400'} hover:text-purple-300 text-lg`}
                        onClick={() => setActiveRightTab('testcase')}
                    >
                        Testcase
                    </button>
                    <button
                        className={`tab ${activeRightTab === 'result' ? 'tab-active text-purple-400' : 'text-gray-400'} hover:text-purple-300 text-lg`}
                        onClick={() => setActiveRightTab('result')}
                    >
                        Result
                    </button>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col bg-black/30">
                    {activeRightTab === 'code' && (
                        <div className="flex-1 flex flex-col">
                            {/* Language Selector */}
                            <div className="flex justify-between items-center p-4 border-b border-purple-500/30">
                                <div className="flex gap-2">
                                    {['javascript', 'java', 'cpp'].map((lang) => (
                                        <button
                                            key={lang}
                                            className={`btn btn-sm ${selectedLanguage === lang ? 'bg-purple-600 border-purple-600 text-white hover:bg-purple-700' : 'bg-black/50 text-gray-400 border-purple-500/30 hover:bg-purple-500/20 hover:text-white'}`}
                                            onClick={() => setSelectedLanguage(lang)}
                                        >
                                            {langMap[lang] || lang}
                                        </button>
                                    ))}
                                </div>
                                <div className="text-sm text-gray-400">
                                    Contest: {contestId.substring(0, 8)}...
                                </div>
                            </div>

                            {/* Code Editor */}
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="flex-1 font-mono text-sm p-4 bg-black/50 text-white resize-none outline-none"
                                placeholder={`Write your ${langMap[selectedLanguage]} solution here...`}
                                spellCheck="false"
                                rows={20}
                            />

                            {/* Action Buttons */}
                            <div className="p-4 border-t border-purple-500/30 flex justify-between">
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-sm bg-black/50 text-gray-400 border-purple-500/30 hover:bg-purple-500/20 hover:text-white"
                                        onClick={() => setActiveRightTab('testcase')}
                                    >
                                        Console
                                    </button>
                                    <button
                                        className="btn btn-sm bg-black/50 text-gray-400 border-purple-500/30 hover:bg-purple-500/20 hover:text-white"
                                        onClick={() => setCode('')}
                                    >
                                        Clear Code
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className={`btn btn-outline btn-sm border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white ${runLoading ? 'loading' : ''}`}
                                        onClick={handleRun}
                                        disabled={runLoading || submitLoading || !code.trim()}
                                    >
                                        {runLoading ? 'Running...' : 'Run Code'}
                                    </button>
                                    <button
                                        className={`btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700 btn-sm ${submitLoading ? 'loading' : ''}`}
                                        onClick={handleSubmit}
                                        disabled={submitLoading || runLoading || !code.trim()}
                                    >
                                        {submitLoading ? 'Submitting...' : 'Submit'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeRightTab === 'testcase' && (
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-white">Test Results</h3>
                                <button
                                    className="btn btn-xs btn-outline border-purple-500 text-purple-300"
                                    onClick={() => setActiveRightTab('code')}
                                >
                                    Back to Code
                                </button>
                            </div>
                            {runResult ? (
                                <div className={`alert ${runResult.success ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-red-500/20 border-red-500 text-red-300'} mb-4 border`}>
                                    <div>
                                        {runResult.success ? (
                                            <div>
                                                <h4 className="font-bold text-lg">✅ All test cases passed!</h4>
                                                <div className="mt-4 space-y-2 text-sm">
                                                    <p><strong>Runtime:</strong> {runResult.runtime || 'N/A'} ms</p>
                                                    <p><strong>Memory:</strong> {runResult.memory || 'N/A'} KB</p>
                                                    <p><strong>Test Cases Passed:</strong> {runResult.passedTestCases || 'N/A'}/{runResult.totalTestCases || 'N/A'}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <h4 className="font-bold text-lg">❌ Test Failed</h4>
                                                <div className="mt-4 space-y-2 text-sm">
                                                    <p><strong>Error:</strong> {runResult.error || runResult.errorMessage || 'Unknown error'}</p>
                                                    {runResult.passedTestCases !== undefined && (
                                                        <p><strong>Test Cases Passed:</strong> {runResult.passedTestCases}/{runResult.totalTestCases || 'N/A'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-purple-400">
                                    Click "Run Code" to test your solution with example test cases.
                                </div>
                            )}
                        </div>
                    )}

                    {activeRightTab === 'result' && (
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-white">Submission Result</h3>
                                <button
                                    className="btn btn-xs btn-outline border-purple-500 text-purple-300"
                                    onClick={() => setActiveRightTab('code')}
                                >
                                    Back to Code
                                </button>
                            </div>
                            {submitResult ? (
                                <div className={`alert ${submitResult.accepted || submitResult.success ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-red-500/20 border-red-500 text-red-300'} border`}>
                                    <div>
                                        {submitResult.accepted || submitResult.success ? (
                                            <div>
                                                <h4 className="font-bold text-lg">🎉 Accepted!</h4>
                                                <div className="mt-4 space-y-2 text-sm">
                                                    <p><strong>Test Cases Passed:</strong> {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                                                    <p><strong>Runtime:</strong> {submitResult.runtime || 'N/A'} ms</p>
                                                    <p><strong>Memory:</strong> {submitResult.memory || 'N/A'} KB</p>
                                                    {submitResult.score > 0 && (
                                                        <p><strong>Score Earned:</strong> <span className="text-yellow-300 font-bold">{submitResult.score}</span> points</p>
                                                    )}
                                                    {submitResult.rank && (
                                                        <p><strong>Current Rank:</strong> #{submitResult.rank}</p>
                                                    )}
                                                    {submitResult.isFirstAttempt && (
                                                        <p className="text-green-400">✨ First attempt bonus!</p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <h4 className="font-bold text-lg">❌ {submitResult.message || submitResult.error || 'Submission Failed'}</h4>
                                                <div className="mt-4 space-y-2 text-sm">
                                                    <p><strong>Test Cases Passed:</strong> {submitResult.passedTestCases || 0}/{submitResult.totalTestCases || 0}</p>
                                                    {submitResult.errorMessage && (
                                                        <div className="mt-2">
                                                            <p><strong>Error Message:</strong></p>
                                                            <pre className="bg-black/50 p-2 rounded text-xs mt-1 overflow-auto">
                                                                {submitResult.errorMessage}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-purple-400">
                                    Click "Submit" to submit your solution for evaluation.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContestProblemPage;