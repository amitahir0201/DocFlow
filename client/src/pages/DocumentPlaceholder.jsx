import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, FileCode } from 'lucide-react';

const DocumentPlaceholder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-semibold">Dashboard</span>
          </button>
          <div className="h-5 w-px bg-slate-200"></div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900">Document #{id?.substring(0, 8)}...</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-12 text-center w-full max-w-lg">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileCode className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Document Editor</h2>
          <p className="text-sm text-slate-600 mb-4 font-mono bg-slate-100 p-2 rounded border border-slate-200">
            ID: {id}
          </p>
          <p className="text-slate-500 text-sm mb-6">
            The document was created successfully in MongoDB. TipTap rich-text editing will be connected in Step 5.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};

export default DocumentPlaceholder;
