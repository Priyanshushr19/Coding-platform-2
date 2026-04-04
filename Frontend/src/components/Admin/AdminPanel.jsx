// import { useForm, useFieldArray } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useLocation, useNavigate } from 'react-router';
// import { useEffect } from 'react';
// import axiosClient from '../../Utils/axiosClient';

// // Zod schema matching the problem schema
// const problemSchema = z.object({
//   title: z.string().min(1, 'Title is required'),
//   description: z.string().min(1, 'Description is required'),
//   difficulty: z.enum(['easy', 'medium', 'hard']),
//   tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
//   visibleTestCases: z.array(
//     z.object({
//       input: z.string().min(1, 'Input is required'),
//       output: z.string().min(1, 'Output is required'),
//       explanation: z.string().min(1, 'Explanation is required')
//     })
//   ).min(1, 'At least one visible test case required'),
//   hiddenTestCases: z.array(
//     z.object({
//       input: z.string().min(1, 'Input is required'),
//       output: z.string().min(1, 'Output is required')
//     })
//   ).min(1, 'At least one hidden test case required'),
//   startCode: z.array(
//     z.object({
//       language: z.enum(['C++', 'Java', 'JavaScript']),
//       initialCode: z.string().min(1, 'Initial code is required')
//     })
//   ).length(3, 'All three languages required'),
//   referenceSolution: z.array(
//     z.object({
//       language: z.enum(['C++', 'Java', 'JavaScript']),
//       completeCode: z.string().min(1, 'Complete code is required')
//     })
//   ).length(3, 'All three languages required')
// });

// function AdminPanel() {



//   const navigate = useNavigate();
//   const {
//     register,
//     control,
//     handleSubmit,
//     formState: { errors }
//   } = useForm({
//     resolver: zodResolver(problemSchema),
//     defaultValues: {
//       startCode: [
//         { language: 'C++', initialCode: '' },
//         { language: 'Java', initialCode: '' },
//         { language: 'JavaScript', initialCode: '' }
//       ],
//       referenceSolution: [
//         { language: 'C++', completeCode: '' },
//         { language: 'Java', completeCode: '' },
//         { language: 'JavaScript', completeCode: '' }
//       ]
//     }
//   });

//   const {
//     fields: visibleFields,
//     append: appendVisible,
//     remove: removeVisible
//   } = useFieldArray({
//     control,
//     name: 'visibleTestCases'
//   });

//   const {
//     fields: hiddenFields,
//     append: appendHidden,
//     remove: removeHidden
//   } = useFieldArray({
//     control,
//     name: 'hiddenTestCases'
//   });

//   const onSubmit = async (data) => {
//     try {
//       await axiosClient.post('/problem/create', data);
//       alert('Problem created successfully!');
//       navigate('/');
//     } catch (error) {
//       alert(`Error: ${error.response?.data?.message || error.message}`);
//     }
//   };



//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6">Create New Problem</h1>
      
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         {/* Basic Information */}
//         <div className="card bg-base-100 shadow-lg p-6">
//           <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
//           <div className="space-y-4">
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text">Title</span>
//               </label>
//               <input
//                 {...register('title')}
//                 className={`input input-bordered ${errors.title && 'input-error'}`}
//               />
//               {errors.title && (
//                 <span className="text-error">{errors.title.message}</span>
//               )}
//             </div>

//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text">Description</span>
//               </label>
//               <textarea
//                 {...register('description')}
//                 className={`textarea textarea-bordered h-32 ${errors.description && 'textarea-error'}`}
//               />
//               {errors.description && (
//                 <span className="text-error">{errors.description.message}</span>
//               )}
//             </div>

//             <div className="flex gap-4">
//               <div className="form-control w-1/2">
//                 <label className="label">
//                   <span className="label-text">Difficulty</span>
//                 </label>
//                 <select
//                   {...register('difficulty')}
//                   className={`select select-bordered ${errors.difficulty && 'select-error'}`}
//                 >
//                   <option value="easy">Easy</option>
//                   <option value="medium">Medium</option>
//                   <option value="hard">Hard</option>
//                 </select>
//               </div>

//               <div className="form-control w-1/2">
//                 <label className="label">
//                   <span className="label-text">Tag</span>
//                 </label>
//                 <select
//                   {...register('tags')}
//                   className={`select select-bordered ${errors.tags && 'select-error'}`}
//                 >
//                   <option value="array">Array</option>
//                   <option value="linkedList">Linked List</option>
//                   <option value="graph">Graph</option>
//                   <option value="dp">DP</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Test Cases */}
//         <div className="card bg-base-100 shadow-lg p-6">
//           <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
          
//           {/* Visible Test Cases */}
//           <div className="space-y-4 mb-6">
//             <div className="flex justify-between items-center">
//               <h3 className="font-medium">Visible Test Cases</h3>
//               <button
//                 type="button"
//                 onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
//                 className="btn btn-sm btn-primary"
//               >
//                 Add Visible Case
//               </button>
//             </div>
            
//             {visibleFields.map((field, index) => (
//               <div key={field.id} className="border p-4 rounded-lg space-y-2">
//                 <div className="flex justify-end">
//                   <button
//                     type="button"
//                     onClick={() => removeVisible(index)}
//                     className="btn btn-xs btn-error"
//                   >
//                     Remove
//                   </button>
//                 </div>
                
//                 <input
//                   {...register(`visibleTestCases.${index}.input`)}
//                   placeholder="Input"
//                   className="input input-bordered w-full"
//                 />
                
//                 <input
//                   {...register(`visibleTestCases.${index}.output`)}
//                   placeholder="Output"
//                   className="input input-bordered w-full"
//                 />
                
//                 <textarea
//                   {...register(`visibleTestCases.${index}.explanation`)}
//                   placeholder="Explanation"
//                   className="textarea textarea-bordered w-full"
//                 />
//               </div>
//             ))}
//           </div>

//           {/* Hidden Test Cases */}
//           <div className="space-y-4">
//             <div className="flex justify-between items-center">
//               <h3 className="font-medium">Hidden Test Cases</h3>
//               <button
//                 type="button"
//                 onClick={() => appendHidden({ input: '', output: '' })}
//                 className="btn btn-sm btn-primary"
//               >
//                 Add Hidden Case
//               </button>
//             </div>
            
//             {hiddenFields.map((field, index) => (
//               <div key={field.id} className="border p-4 rounded-lg space-y-2">
//                 <div className="flex justify-end">
//                   <button
//                     type="button"
//                     onClick={() => removeHidden(index)}
//                     className="btn btn-xs btn-error"
//                   >
//                     Remove
//                   </button>
//                 </div>
                
//                 <input
//                   {...register(`hiddenTestCases.${index}.input`)}
//                   placeholder="Input"
//                   className="input input-bordered w-full"
//                 />
                
//                 <input
//                   {...register(`hiddenTestCases.${index}.output`)}
//                   placeholder="Output"
//                   className="input input-bordered w-full"
//                 />
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Code Templates */}
//         <div className="card bg-base-100 shadow-lg p-6">
//           <h2 className="text-xl font-semibold mb-4">Code Templates</h2>
          
//           <div className="space-y-6">
//             {[0, 1, 2].map((index) => (
//               <div key={index} className="space-y-2">
//                 <h3 className="font-medium">
//                   {index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'}
//                 </h3>
                
//                 <div className="form-control">
//                   <label className="label">
//                     <span className="label-text">Initial Code</span>
//                   </label>
//                   <pre className="bg-base-300 p-4 rounded-lg">
//                     <textarea
//                       {...register(`startCode.${index}.initialCode`)}
//                       className="w-full bg-transparent font-mono"
//                       rows={6}
//                     />
//                   </pre>
//                 </div>
                
//                 <div className="form-control">
//                   <label className="label">
//                     <span className="label-text">Reference Solution</span>
//                   </label>
//                   <pre className="bg-base-300 p-4 rounded-lg">
//                     <textarea
//                       {...register(`referenceSolution.${index}.completeCode`)}
//                       className="w-full bg-transparent font-mono"
//                       rows={6}
//                     />
//                   </pre>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <button type="submit" className="btn btn-primary w-full">
//           Create Problem
//         </button>
//       </form>
//     </div>
//   );
// }

// export default AdminPanel;
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import axiosClient from '../../Utils/axiosClient';
import { 
  Plus, Trash2, Code, FileText, TestTube, 
  Sparkles, Zap, Shield, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle, XCircle, Save
} from 'lucide-react';

// Zod schema matching the problem schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminPanel() {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    testCases: true,
    codeTemplates: true
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: 'C++', initialCode: '// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}' },
        { language: 'Java', initialCode: '// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}' },
        { language: 'JavaScript', initialCode: '// Write your JavaScript code here\nfunction solution() {\n    // Your code here\n}' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      await axiosClient.post('/problem/create', data);
      alert('Problem created successfully!');
      navigate('/admin');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
        <FileText size={80} />
      </div>

      <div className="relative z-10 container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-slideIn">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-70 animate-pulse"></div>
              <div className="relative bg-black rounded-lg p-2">
                <Plus size={28} className="text-purple-400" />
              </div>
            </div>
            <h1 className="text-4xl font-black">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient">
                Create New Problem
              </span>
            </h1>
          </div>
          <p className="text-purple-300/80 flex items-center gap-2 mt-2">
            <Sparkles size={16} className="text-yellow-400" />
            Fill in the details below to add a new coding challenge to the platform
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl overflow-hidden animate-slideIn animation-delay-200">
            <div 
              className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/30 to-purple-800/20 border-b border-purple-500/30 cursor-pointer"
              onClick={() => toggleSection('basic')}
            >
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Basic Information</h2>
              </div>
              {expandedSections.basic ? <ChevronUp size={20} className="text-purple-400" /> : <ChevronDown size={20} className="text-purple-400" />}
            </div>
            
            {expandedSections.basic && (
              <div className="p-6 space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-purple-300">Title</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                    <input
                      {...register('title')}
                      className={`relative w-full px-4 py-2 bg-black/50 border-2 rounded-lg text-white placeholder-purple-300/30 outline-none transition-all ${
                        errors.title 
                          ? 'border-red-500/50 focus:border-red-500' 
                          : 'border-purple-500/30 focus:border-purple-400'
                      }`}
                      placeholder="e.g., Two Sum"
                    />
                  </div>
                  {errors.title && (
                    <span className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <XCircle size={14} />
                      {errors.title.message}
                    </span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-purple-300">Description</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                    <textarea
                      {...register('description')}
                      rows={6}
                      className={`relative w-full px-4 py-2 bg-black/50 border-2 rounded-lg text-white placeholder-purple-300/30 outline-none transition-all ${
                        errors.description 
                          ? 'border-red-500/50 focus:border-red-500' 
                          : 'border-purple-500/30 focus:border-purple-400'
                      }`}
                      placeholder="Describe the problem in detail..."
                    />
                  </div>
                  {errors.description && (
                    <span className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <XCircle size={14} />
                      {errors.description.message}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-purple-300">Difficulty</span>
                    </label>
                    <select
                      {...register('difficulty')}
                      className={`w-full px-4 py-2 bg-black/50 border-2 rounded-lg text-white outline-none transition-all ${
                        errors.difficulty 
                          ? 'border-red-500/50 focus:border-red-500' 
                          : 'border-purple-500/30 focus:border-purple-400'
                      }`}
                    >
                      <option value="easy" className="bg-black">🟢 Easy</option>
                      <option value="medium" className="bg-black">🟡 Medium</option>
                      <option value="hard" className="bg-black">🔴 Hard</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-purple-300">Tag</span>
                    </label>
                    <select
                      {...register('tags')}
                      className={`w-full px-4 py-2 bg-black/50 border-2 rounded-lg text-white outline-none transition-all ${
                        errors.tags 
                          ? 'border-red-500/50 focus:border-red-500' 
                          : 'border-purple-500/30 focus:border-purple-400'
                      }`}
                    >
                      <option value="array" className="bg-black">📚 Array</option>
                      <option value="linkedList" className="bg-black">🔗 Linked List</option>
                      <option value="graph" className="bg-black">🕸️ Graph</option>
                      <option value="dp" className="bg-black">🧮 Dynamic Programming</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Test Cases */}
          <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl overflow-hidden animate-slideIn animation-delay-400">
            <div 
              className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/30 to-purple-800/20 border-b border-purple-500/30 cursor-pointer"
              onClick={() => toggleSection('testCases')}
            >
              <div className="flex items-center gap-2">
                <TestTube size={20} className="text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Test Cases</h2>
              </div>
              {expandedSections.testCases ? <ChevronUp size={20} className="text-purple-400" /> : <ChevronDown size={20} className="text-purple-400" />}
            </div>
            
            {expandedSections.testCases && (
              <div className="p-6 space-y-6">
                {/* Visible Test Cases */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-purple-300 flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      Visible Test Cases
                    </h3>
                    <button
                      type="button"
                      onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                      className="group relative px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 hover:text-white hover:border-green-400 hover:bg-green-500/20 transition-all duration-300 overflow-hidden text-sm"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/20 to-green-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                      <span className="relative flex items-center gap-1">
                        <Plus size={14} />
                        Add Visible Case
                      </span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {visibleFields.map((field, index) => (
                      <div 
                        key={field.id} 
                        className="relative group border border-purple-500/30 rounded-lg p-4 hover:border-purple-400 transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-lg"></div>
                        
                        <div className="flex justify-end mb-2 relative">
                          <button
                            type="button"
                            onClick={() => removeVisible(index)}
                            className="p-1 bg-red-500/10 border border-red-500/30 rounded text-red-400 hover:bg-red-500/20 hover:text-white transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        <div className="space-y-3 relative">
                          <input
                            {...register(`visibleTestCases.${index}.input`)}
                            placeholder="Input (e.g., [1,2,3], target = 5)"
                            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all"
                          />
                          
                          <input
                            {...register(`visibleTestCases.${index}.output`)}
                            placeholder="Expected Output"
                            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all"
                          />
                          
                          <textarea
                            {...register(`visibleTestCases.${index}.explanation`)}
                            placeholder="Explanation"
                            rows={2}
                            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all"
                          />
                        </div>
                      </div>
                    ))}
                    
                    {visibleFields.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-purple-500/30 rounded-lg">
                        <TestTube size={32} className="mx-auto text-purple-400 mb-2 opacity-50" />
                        <p className="text-purple-300">No visible test cases added yet</p>
                        <p className="text-sm text-purple-400/60 mt-1">Click the button above to add one</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hidden Test Cases */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-purple-300 flex items-center gap-2">
                      <Shield size={16} className="text-yellow-400" />
                      Hidden Test Cases
                    </h3>
                    <button
                      type="button"
                      onClick={() => appendHidden({ input: '', output: '' })}
                      className="group relative px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 hover:text-white hover:border-yellow-400 hover:bg-yellow-500/20 transition-all duration-300 overflow-hidden text-sm"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                      <span className="relative flex items-center gap-1">
                        <Plus size={14} />
                        Add Hidden Case
                      </span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {hiddenFields.map((field, index) => (
                      <div 
                        key={field.id} 
                        className="relative group border border-purple-500/30 rounded-lg p-4 hover:border-purple-400 transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-lg"></div>
                        
                        <div className="flex justify-end mb-2 relative">
                          <button
                            type="button"
                            onClick={() => removeHidden(index)}
                            className="p-1 bg-red-500/10 border border-red-500/30 rounded text-red-400 hover:bg-red-500/20 hover:text-white transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        <div className="space-y-3 relative">
                          <input
                            {...register(`hiddenTestCases.${index}.input`)}
                            placeholder="Input"
                            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all"
                          />
                          
                          <input
                            {...register(`hiddenTestCases.${index}.output`)}
                            placeholder="Expected Output"
                            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded text-white placeholder-purple-300/30 outline-none focus:border-purple-400 transition-all"
                          />
                        </div>
                      </div>
                    ))}
                    
                    {hiddenFields.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-purple-500/30 rounded-lg">
                        <Shield size={32} className="mx-auto text-purple-400 mb-2 opacity-50" />
                        <p className="text-purple-300">No hidden test cases added yet</p>
                        <p className="text-sm text-purple-400/60 mt-1">Click the button above to add one</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Code Templates */}
          <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl overflow-hidden animate-slideIn animation-delay-600">
            <div 
              className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/30 to-purple-800/20 border-b border-purple-500/30 cursor-pointer"
              onClick={() => toggleSection('codeTemplates')}
            >
              <div className="flex items-center gap-2">
                <Code size={20} className="text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Code Templates</h2>
              </div>
              {expandedSections.codeTemplates ? <ChevronUp size={20} className="text-purple-400" /> : <ChevronDown size={20} className="text-purple-400" />}
            </div>
            
            {expandedSections.codeTemplates && (
              <div className="p-6 space-y-8">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="space-y-4">
                    <h3 className="font-medium text-purple-300 flex items-center gap-2 border-b border-purple-500/30 pb-2">
                      <Zap size={16} className="text-yellow-400" />
                      {index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-purple-300 mb-2">Initial Code Template</label>
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                          <textarea
                            {...register(`startCode.${index}.initialCode`)}
                            rows={6}
                            className="relative w-full px-4 py-3 bg-black/70 border-2 border-purple-500/30 rounded-lg text-green-400 font-mono text-sm outline-none focus:border-purple-400 transition-all"
                            placeholder={`// Write your ${index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'} code here`}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-purple-300 mb-2">Reference Solution</label>
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                          <textarea
                            {...register(`referenceSolution.${index}.completeCode`)}
                            rows={6}
                            className="relative w-full px-4 py-3 bg-black/70 border-2 border-purple-500/30 rounded-lg text-blue-400 font-mono text-sm outline-none focus:border-purple-400 transition-all"
                            placeholder={`// Complete solution in ${index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitLoading}
            className="group relative w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed animate-slideIn animation-delay-800"
          >
            <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            <span className="relative flex items-center justify-center gap-2">
              {submitLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Problem...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create Problem
                </>
              )}
            </span>
          </button>
        </form>
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
        
        .bg-300\% {
          background-size: 300%;
        }
      `}</style>
    </div>
  );
}

export default AdminPanel;