import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FileText,
  Plus,
  Upload,
  LogOut,
  User as UserIcon,
  Folder,
  Share2,
  Clock,
  Trash2,
  AlertCircle,
  RefreshCw,
  FilePlus,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('my-docs'); // 'my-docs' | 'shared'
  const [documents, setDocuments] = useState([]);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const [ownedRes, sharedRes] = await Promise.all([
        api.get('/documents'),
        api.get('/documents/shared'),
      ]);
      setDocuments(ownedRes.data.documents || []);
      setSharedDocuments(sharedRes.data.documents || []);
    } catch (err) {
      console.error('Fetch documents error:', err);
      setError('Unable to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleCreateDocument = async () => {
    setCreating(true);
    setError('');
    try {
      const res = await api.post('/documents', {
        title: 'Untitled Document',
        content: '',
      });
      const newDoc = res.data.document;
      navigate(`/document/${newDoc.id}`);
    } catch (err) {
      console.error('Create document error:', err);
      setError('Unable to create document. Please try again.');
      setCreating(false);
    }
  };

  const handleUploadClick = () => {
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    const filename = file.name.toLowerCase();
    if (!filename.endsWith('.txt') && !filename.endsWith('.md')) {
      setError('Only .txt and .md files are supported.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5 MB.');
      e.target.value = '';
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData);
      const newDoc = res.data.document;
      navigate(`/document/${newDoc.id}`);
    } catch (err) {
      console.error('Upload file error:', err);
      const message =
        err.response?.data?.message || 'Unable to upload file. Please try again.';
      setError(message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error('Delete document error:', err);
      alert('Unable to delete document. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt,.md"
        className="hidden"
      />

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-2xs sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
              DocFlow
            </span>
            <span className="text-2xs text-slate-500 font-medium tracking-wide">
              Simple collaborative documents for teams
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full font-medium border border-slate-200">
            <UserIcon className="w-4 h-4 text-indigo-600" />
            <span>{user?.name || 'User'}</span>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-slate-100"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 md:p-6 flex flex-col space-y-6 flex-shrink-0">
          <div className="space-y-2">
            <button
              onClick={handleCreateDocument}
              disabled={creating || uploading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer text-sm"
            >
              {creating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>New Document</span>
                </>
              )}
            </button>

            <button
              onClick={handleUploadClick}
              disabled={uploading || creating}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors cursor-pointer text-sm border border-slate-200 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Upload File</span>
                </>
              )}
            </button>
            <p className="text-2xs text-slate-400 text-center">Supported files: .txt, .md</p>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('my-docs')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'my-docs'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Folder className="w-4 h-4" />
                <span>My Documents</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('shared')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'shared'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Share2 className="w-4 h-4" />
                <span>Shared With Me</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                {sharedDocuments.length}
              </span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchDocuments}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
                <button
                  onClick={() => setError('')}
                  className="text-red-600 font-bold ml-2 text-base cursor-pointer"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {activeTab === 'my-docs' ? 'My Documents' : 'Shared With Me'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'my-docs'
                  ? 'Manage and edit your personal documents.'
                  : 'Documents shared with you by teammates.'}
              </p>
            </div>

            {activeTab === 'my-docs' && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleUploadClick}
                  disabled={uploading || creating}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Upload File</span>
                </button>

                <button
                  onClick={handleCreateDocument}
                  disabled={creating || uploading}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Document</span>
                </button>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="text-sm font-medium">Loading documents...</span>
            </div>
          )}

          {/* My Documents Tab Content */}
          {!loading && activeTab === 'my-docs' && (
            <>
              {documents.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 shadow-2xs">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FilePlus className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No documents yet</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Create your first document or upload a .txt / .md file to get started.
                  </p>
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={handleUploadClick}
                      disabled={uploading}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload File</span>
                    </button>
                    <button
                      onClick={handleCreateDocument}
                      disabled={creating}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Document</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => navigate(`/document/${doc.id}`)}
                      className="group bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Owned by you
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                          {doc.title || 'Untitled Document'}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-2 min-h-8">
                          {doc.content
                            ? doc.content.replace(/<[^>]*>/g, '') || 'Empty document'
                            : 'Empty document'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Updated {formatDate(doc.updatedAt)}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => handleDeleteDocument(e, doc.id)}
                            disabled={deletingId === doc.id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Shared With Me Tab Content */}
          {!loading && activeTab === 'shared' && (
            <>
              {sharedDocuments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 shadow-2xs">
                  <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Share2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No shared documents yet</h3>
                  <p className="text-sm text-slate-500">
                    Documents shared with you by other team members will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sharedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => navigate(`/document/${doc.id}`)}
                      className="group bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-2xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center space-x-1">
                            <UserCheck className="w-3 h-3 mr-0.5" />
                            <span>Shared by {doc.owner?.name || 'Owner'}</span>
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                          {doc.title || 'Untitled Document'}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-2 min-h-8">
                          {doc.content
                            ? doc.content.replace(/<[^>]*>/g, '') || 'Empty document'
                            : 'Empty document'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Updated {formatDate(doc.updatedAt)}</span>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
