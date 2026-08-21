import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import api from '../services/api';
import {
  FileText,
  ArrowLeft,
  Save,
  Trash2,
  Share2,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Mail,
  UserCheck,
} from 'lucide-react';

// Define extensions outside component to prevent TipTap duplicate extension warnings
// StarterKit in TipTap v3 includes Underline by default
const EDITOR_EXTENSIONS = [StarterKit];

const DocumentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [docOwner, setDocOwner] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'unsaved' | 'saving'
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');

  // Store fetched HTML content string independently of TipTap initialization
  const [docContent, setDocContent] = useState(null);

  // Share Modal States
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState({ type: '', message: '' }); // type: 'success' | 'error'
  const [sharedUsers, setSharedUsers] = useState([]);

  // Track currently populated document ID to handle route transitions cleanly
  const loadedDocIdRef = useRef(null);

  // Initialize TipTap Editor
  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
    content: '',
    onUpdate: () => {
      if (loadedDocIdRef.current === id) {
        setSaveStatus('unsaved');
      }
    },
    editorProps: {
      attributes: {
        class:
          'focus:outline-none min-h-[500px] p-8 text-slate-800 text-base leading-relaxed max-w-none prose prose-indigo',
      },
    },
  });

  // 1. Fetch Document from API immediately whenever `id` changes (independent of TipTap editor state)
  useEffect(() => {
    let isMounted = true;

    const fetchDocument = async () => {
      if (!id || id === 'undefined') return;

      setLoading(true);
      setError('');
      setDocContent(null);

      try {
        const res = await api.get(`/documents/${id}`);
        if (!isMounted) return;

        const doc = res.data.document;
        setTitle(doc.title || 'Untitled Document');
        setIsOwner(res.data.isOwner);
        setDocOwner(doc.owner);
        setDocContent(doc.content || '');
        setSaveStatus('saved');
      } catch (err) {
        if (!isMounted) return;
        console.error('Fetch document error:', err);
        const status = err.response?.status;
        if (status === 403) {
          setError("You don't have access to this document.");
        } else if (status === 404) {
          setError('Document not found.');
        } else {
          setError('Unable to load document. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDocument();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // 2. Populate TipTap Editor content as soon as both `editor` instance and `docContent` are available
  useEffect(() => {
    if (editor && !editor.isDestroyed && docContent !== null && loadedDocIdRef.current !== id) {
      editor.commands.setContent(docContent);
      loadedDocIdRef.current = id;
    }
  }, [editor, docContent, id]);

  // Fetch Shared Users when Share Modal opens
  const fetchShares = async () => {
    try {
      const res = await api.get(`/documents/${id}/shares`);
      setSharedUsers(res.data.shares || []);
    } catch (err) {
      console.error('Fetch shares error:', err);
    }
  };

  const openShareModal = () => {
    setShareModalOpen(true);
    setShareEmail('');
    setShareStatus({ type: '', message: '' });
    fetchShares();
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setShareStatus({ type: '', message: '' });

    if (!shareEmail.trim()) {
      setShareStatus({ type: 'error', message: 'Email address is required.' });
      return;
    }

    setSharing(true);
    try {
      const res = await api.post(`/documents/${id}/share`, {
        email: shareEmail.trim(),
      });

      setShareStatus({
        type: 'success',
        message: res.data.message || 'Document shared successfully.',
      });
      setShareEmail('');
      fetchShares();
    } catch (err) {
      console.error('Share error:', err);
      const msg =
        err.response?.data?.message || 'Unable to share document. Please try again.';
      setShareStatus({ type: 'error', message: msg });
    } finally {
      setSharing(false);
    }
  };

  // Handle Title Changes
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setSaveStatus('unsaved');
  };

  // Handle Manual Save
  const handleSave = async () => {
    if (!editor || !editor.commands || saveStatus === 'saving') return;

    setSaveStatus('saving');
    setSaveError('');

    try {
      const currentHTML = editor.getHTML();
      const documentTitle = title.trim() || 'Untitled Document';

      const res = await api.put(`/documents/${id}`, {
        title: documentTitle,
        content: currentHTML,
      });

      setTitle(res.data.document.title);
      setSaveStatus('saved');
    } catch (err) {
      console.error('Save document error:', err);
      setSaveError('Unable to save document. Please try again.');
      setSaveStatus('unsaved');
    }
  };

  // Handle Document Delete (Owner Only)
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.delete(`/documents/${id}`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Delete document error:', err);
      const msg = err.response?.data?.message || 'Unable to delete document.';
      alert(msg);
    }
  };

  // Handle Back Navigation with unsaved warning
  const handleBack = () => {
    if (saveStatus === 'unsaved') {
      if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        return;
      }
    }
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex items-center space-x-3 text-slate-600">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="font-semibold text-sm">Loading document...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">{error}</h2>
          <p className="text-sm text-slate-500 mb-6">
            Please verify the document link or contact the owner for access.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-2xs sticky top-0 z-20">
        <div className="flex items-center space-x-4 flex-1 max-w-2xl">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors flex items-center space-x-1.5 cursor-pointer text-sm font-semibold flex-shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="h-5 w-px bg-slate-200 flex-shrink-0"></div>

          <div className="flex items-center space-x-2 flex-1">
            <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>

            {/* Title Input */}
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled Document"
              className="w-full text-lg font-bold text-slate-900 bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white px-2 py-1 rounded transition-all focus:outline-none"
            />
          </div>

          {!isOwner && docOwner && (
            <span className="hidden md:inline-flex items-center text-2xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Shared by {docOwner.name}
            </span>
          )}
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-3">
          {/* Save Status Indicator */}
          <div className="text-xs font-semibold flex items-center space-x-1.5">
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Saved
              </span>
            )}

            {saveStatus === 'unsaved' && (
              <span className="inline-flex items-center text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
                Unsaved changes
              </span>
            )}

            {saveStatus === 'saving' && (
              <span className="inline-flex items-center text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Saving...
              </span>
            )}
          </div>

          {/* Share Button (OWNER ONLY) */}
          {isOwner && (
            <button
              onClick={openShareModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-indigo-600" />
              <span>Share</span>
            </button>
          )}

          {/* Manual Save Button */}
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>

          {/* Delete Button (OWNER ONLY) */}
          {isOwner && (
            <button
              onClick={handleDelete}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Save Error Alert */}
      {saveError && (
        <div className="bg-red-50 border-b border-red-200 p-3 text-center text-xs font-semibold text-red-700 flex items-center justify-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Toolbar */}
      {editor && (
        <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center space-x-1 overflow-x-auto shadow-xs sticky top-[57px] z-10">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
              editor.isActive('bold')
                ? 'bg-indigo-100 text-indigo-700 font-bold'
                : 'text-slate-600'
            }`}
            title="Bold (Ctrl+B)"
          >
            <BoldIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
              editor.isActive('italic')
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-slate-600'
            }`}
            title="Italic (Ctrl+I)"
          >
            <ItalicIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
              editor.isActive('underline')
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-slate-600'
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1"></div>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-indigo-100 text-indigo-700 font-bold'
                : 'text-slate-600'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-indigo-100 text-indigo-700 font-bold'
                : 'text-slate-600'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1"></div>

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
              editor.isActive('bulletList')
                ? 'bg-indigo-100 text-indigo-700 font-bold'
                : 'text-slate-600'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
              editor.isActive('orderedList')
                ? 'bg-indigo-100 text-indigo-700 font-bold'
                : 'text-slate-600'
            }`}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <main className="flex-1 py-8 px-4 sm:px-6 flex justify-center overflow-y-auto">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 w-full max-w-4xl min-h-[650px] transition-shadow duration-200 hover:shadow-lg">
          <EditorContent editor={editor} />
        </div>
      </main>

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Share "{title || 'Untitled Document'}"
                </h3>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {shareStatus.message && (
              <div
                className={`mb-4 p-3 rounded-lg text-xs font-semibold flex items-center space-x-2 ${
                  shareStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {shareStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span>{shareStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleShareSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={sharing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {sharing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* List of Shared Users */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Shared With
              </h4>

              {sharedUsers.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Not shared with anyone yet.</p>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {sharedUsers.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-800">{item.user.name}</div>
                          <div className="text-2xs text-slate-500">{item.user.email}</div>
                        </div>
                      </div>
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        Editor
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentEditor;
