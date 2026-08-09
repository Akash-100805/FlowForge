import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  LayoutTemplate, 
  StickyNote, 
  GitBranch, 
  Bold, 
  Italic, 
  Underline, 
  Save, 
  Clock, 
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getNote, updateNote } from '../services/noteService';
import { connectSocket, joinProject, leaveProject, getSocket } from '../socket/socket';

export default function NotesPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await getNote(projectId);
        setContent(res.data.content || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();

    const socket = connectSocket();
    joinProject(projectId);

    socket.on('note:updated', (data) => {
      if (data.projectId === projectId) {
        setContent(data.content);
        setLastSaved(new Date());
        if (editorRef.current && document.activeElement !== editorRef.current) {
          editorRef.current.innerHTML = data.content;
        }
      }
    });

    return () => {
      leaveProject(projectId);
      const s = getSocket();
      if (s) s.off('note:updated');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [projectId]);

  useEffect(() => {
    if (!loading && editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [loading, content]);

  const handleInput = (e) => {
    const newContent = e.currentTarget.innerHTML;
    setContent(newContent);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(newContent);
    }, 1000);
  };

  const applyFormat = (command) => {
    document.execCommand(command, false, null);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput({ currentTarget: editorRef.current });
    }
  };

  const handleSave = async (text) => {
    setSaving(true);
    try {
      await updateNote(projectId, { content: text });
      setLastSaved(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    handleSave(content);
  };

  return (
    <div className="min-h-screen bg-primary">
      <Sidebar onNewProject={() => navigate('/dashboard')} />

      <main className="ml-64 flex flex-col h-screen animate-fade-in">
        {/* Top Bar Navigation */}
        <div className="px-8 py-5 border-b border-border bg-sidebar/50 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary hover:bg-hover text-text-tertiary hover:text-text-primary transition-all shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-black text-text-primary tracking-tight">Project Notes</h2>
              </div>
              
              <nav className="flex items-center gap-2">
                {[
                  { label: 'Board', icon: LayoutTemplate, path: `/project/${projectId}/board` },
                  { label: 'Notes', icon: StickyNote, path: `/project/${projectId}/notes`, active: true },
                  { label: 'GitHub', icon: GitBranch, path: `/project/${projectId}/github` }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => !item.active && navigate(item.path)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      item.active 
                        ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                        : 'text-text-tertiary hover:text-text-primary hover:bg-hover'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {lastSaved && (
                <div className="flex flex-col items-end mr-2">
                  <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Live Sync Active
                  </p>
                  <p className="text-[9px] font-bold text-text-tertiary opacity-60">
                    Saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
              <button 
                onClick={handleManualSave} 
                disabled={saving} 
                className="btn-accent px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-accent/20 flex items-center gap-2"
              >
                <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
                <span>{saving ? 'Syncing...' : 'Save Now'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
            <p className="text-text-tertiary font-bold animate-pulse">Initializing editor...</p>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Main Editor */}
            <div className="flex-1 flex flex-col p-10 overflow-hidden bg-primary/20">
              {/* Floating Format Toolbar */}
              <div className="flex items-center gap-1 bg-sidebar border border-border p-1.5 rounded-2xl shadow-xl w-fit mb-8 animate-slide-up">
                {[
                  { icon: Bold, command: 'bold', label: 'Bold' },
                  { icon: Italic, command: 'italic', label: 'Italic' },
                  { icon: Underline, command: 'underline', label: 'Underline' }
                ].map((tool) => (
                  <button
                    key={tool.label}
                    onClick={() => applyFormat(tool.command)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-text-tertiary hover:text-accent hover:bg-accent/10 transition-all"
                    title={tool.label}
                  >
                    <tool.icon className="w-4 h-4" />
                  </button>
                ))}
                
                <div className="w-px h-6 bg-border mx-2" />
                
                <div className="px-4 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${saving ? 'bg-accent animate-pulse' : 'bg-green-500'}`} />
                  <span className="text-[10px] font-black text-text-tertiary tracking-widest uppercase">
                    {saving ? 'Transmitting' : 'Ready'}
                  </span>
                </div>
              </div>

              {/* Editable Surface */}
              <div className="flex-1 relative">
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleInput}
                  className="w-full h-full bg-transparent text-text-primary text-lg leading-relaxed focus:outline-none overflow-y-auto custom-scrollbar font-medium"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  data-placeholder="Start documentations or collaborative notes here..."
                />
              </div>
            </div>

            {/* Right Activity Panel */}
            <div className="w-96 border-l border-border bg-sidebar/20 backdrop-blur-sm p-8 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-accent" />
                  </div>
                  <h3 className="font-black text-text-primary tracking-tight">Collaboration</h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-[10px] font-black tracking-widest uppercase border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live
                </div>
              </div>

              <p className="text-xs font-medium text-text-tertiary mb-8 leading-relaxed">
                Watch changes propagate across all connected devices in real-time.
              </p>

              <div className="space-y-4">
                {lastSaved && (
                  <div className="card-styled p-5 animate-scale-in border-accent/20 bg-accent/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-black text-[10px]">
                        U
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text-primary truncate">You</p>
                        <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">Just now</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary font-medium pl-11">
                      Injected fresh content into the project documentation.
                    </p>
                  </div>
                )}

                <div className="card-styled p-5 bg-secondary/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-sidebar border border-border flex items-center justify-center">
                      <Clock className="w-4 h-4 text-text-tertiary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-primary truncate">FlowForge Cluster</p>
                      <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">Always Active</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary font-medium pl-11">
                    Distributed ledger synced successfully with all regional nodes.
                  </p>
                </div>
              </div>
              
              <div className="mt-auto pt-8 border-t border-border/50">
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
                  <p className="text-[11px] font-medium text-text-secondary leading-relaxed">
                    Collaborative sessions are encrypted and persisted automatically. Use standard formatting shortcuts for efficiency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
