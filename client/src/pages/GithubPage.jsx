import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  GitBranch, 
  LayoutTemplate, 
  StickyNote, 
  Folder, 
  FileText, 
  Plus, 
  Sparkles, 
  History, 
  ArrowUpLeft,
  Search,
  CheckCircle2,
  X,
  UploadCloud,
  MessageSquare
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { connectRepo, getRepoFiles, getRepoCommits, uploadRepoFile } from '../services/githubService';
import { getProjects } from '../services/projectService';
import { sendChatMessage } from '../services/aiService';

export default function GithubPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [repoUrlInput, setRepoUrlInput] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  
  const [files, setFiles] = useState([]);
  const [commits, setCommits] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  
  // Upload State
  const [showUpload, setShowUpload] = useState(false);
  const [uploadPath, setUploadPath] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  const fetchRepoData = useCallback(async (path = '') => {
    try {
      const [filesRes, commitsRes] = await Promise.all([
        getRepoFiles(projectId, path),
        getRepoCommits(projectId)
      ]);
      setFiles(Array.isArray(filesRes.data) ? filesRes.data : []);
      setCommits(commitsRes.data);
    } catch (err) {
      console.error("Failed to fetch repo data:", err);
    }
  }, [projectId]);

  const fetchProjectData = useCallback(async () => {
    try {
      const res = await getProjects();
      const current = res.data.find(p => p.id === projectId);
      setProject(current);
      if (current?.repoUrl) {
        await fetchRepoData('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchRepoData, projectId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const handleConnect = async () => {
    if (!repoUrlInput.trim()) return;
    setConnecting(true);
    try {
      await connectRepo(projectId, repoUrlInput.trim());
      await fetchProjectData();
      setRepoUrlInput('');
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleNavigatePath = async (newPath) => {
    setCurrentPath(newPath);
    try {
      const res = await getRepoFiles(projectId, newPath);
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigateUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    handleNavigatePath(parts.join('/'));
  };

  const handleUpload = async () => {
    if (!uploadPath || !uploadContent) return;
    setUploading(true);
    try {
      await uploadRepoFile(projectId, (currentPath ? currentPath + '/' : '') + uploadPath.trim(), uploadContent);
      setShowUpload(false);
      setUploadPath('');
      setUploadContent('');
      fetchRepoData(currentPath);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateCommit = async () => {
    if (!uploadContent) return alert("Write some content first!");
    setAiGenerating(true);
    try {
      const msg = `Generate a concise, 5 word maximum 1-liner commit message for the following file content intended for path '${uploadPath}':\n\n${uploadContent}`;
      const res = await sendChatMessage(msg, projectId);
      alert(`AI Suggested Commit Message:\n${res.data.reply}`);
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSummarizeRepo = async () => {
    setSummarizing(true);
    setAiSummary('');
    try {
      const res = await sendChatMessage("Summarize this repo", projectId);
      setAiSummary(res.data.reply);
    } catch (err) {
      alert(err.message);
    } finally {
      setSummarizing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      <p className="text-text-tertiary font-black animate-pulse uppercase tracking-widest text-xs">Authenticating Vault...</p>
    </div>
  );

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
                <h2 className="text-xl font-black text-text-primary tracking-tight">GitHub Integration</h2>
              </div>
              
              <nav className="flex items-center gap-2">
                {[
                  { label: 'Board', icon: LayoutTemplate, path: `/project/${projectId}/board` },
                  { label: 'Notes', icon: StickyNote, path: `/project/${projectId}/notes` },
                  { label: 'Cloud', icon: GitBranch, path: `/project/${projectId}/github`, active: true }
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
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                Linked Securely
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-primary/20">
          {!project?.repoUrl ? (
            <div className="max-w-2xl mx-auto mt-20 p-12 card-styled bg-sidebar shadow-2xl text-center space-y-8 animate-scale-in">
              <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <GitBranch className="w-10 h-10 text-accent" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-text-primary mb-3">Connect Repository</h2>
                <p className="text-text-secondary font-medium px-10">
                  Bridge your FlowForge project with GitHub to enable real-time file tracking, commit history, and AI-driven codebase analysis.
                </p>
              </div>
              
              <div className="flex gap-3 max-w-lg mx-auto bg-primary p-2 rounded-2xl border border-border shadow-inner">
                <input
                  type="text"
                  placeholder="https://github.com/owner/repository"
                  className="bg-transparent flex-1 px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none"
                  value={repoUrlInput}
                  onChange={e => setRepoUrlInput(e.target.value)}
                />
                <button 
                  onClick={handleConnect} 
                  disabled={connecting} 
                  className="btn-accent px-8 rounded-xl font-black uppercase tracking-widest text-xs"
                >
                  {connecting ? 'Linking...' : 'Initialize'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-10">
              {/* Left Column - Explorer */}
              <div className="flex-1 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center border border-border/50">
                      <GitBranch className="w-6 h-6 text-text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-text-primary">
                        {project.repoUrl.split('/').slice(-2).join('/')}
                      </h2>
                      <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Main Repository Branch</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleSummarizeRepo} 
                      disabled={summarizing} 
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all font-bold text-sm"
                    >
                      <Sparkles className={`w-4 h-4 ${summarizing ? 'animate-pulse' : ''}`} />
                      {summarizing ? 'Analyzing...' : 'AI Summary'}
                    </button>
                    <button 
                      onClick={() => setShowUpload(true)} 
                      className="btn-accent px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-accent/20"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add File</span>
                    </button>
                  </div>
                </div>

                {aiSummary && (
                  <div className="card-styled p-8 border-accent/30 bg-accent/5 animate-slide-up relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 opacity-50 rounded-bl-full pointer-events-none" />
                    <button onClick={() => setAiSummary('')} className="absolute top-6 right-6 text-text-tertiary hover:text-text-primary transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 mb-6">
                      <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                      <h3 className="text-accent font-black text-sm uppercase tracking-widest">Codebase Intelligence</h3>
                    </div>
                    <div className="text-text-secondary text-sm leading-relaxed font-medium whitespace-pre-wrap pl-2 border-l-2 border-accent/20">
                      {aiSummary}
                    </div>
                  </div>
                )}

                <div className="card-styled overflow-hidden bg-sidebar/50 backdrop-blur-sm border-border">
                  <div className="bg-secondary/40 px-6 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-4 font-mono text-xs font-bold text-text-tertiary">
                      {currentPath && (
                        <button 
                          onClick={handleNavigateUp} 
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-accent/10 text-accent border border-accent/10 transition-all"
                        >
                          <ArrowUpLeft className="w-4 h-4" />
                        </button>
                      )}
                      <span className="text-text-primary">/</span>
                      <span className="text-text-secondary">{currentPath}</span>
                    </div>
                    <div className="relative group">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                      <input type="text" placeholder="Locate file..." className="bg-primary/50 border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent w-48 transition-all" />
                    </div>
                  </div>
                  <div className="divide-y divide-border/30">
                    {files.map(file => (
                      <div 
                        key={file.sha} 
                        className="px-6 py-4 flex items-center justify-between hover:bg-hover transition-all cursor-pointer group"
                        onClick={() => file.type === 'dir' && handleNavigatePath(file.path)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            file.type === 'dir' ? 'bg-blue-500/10 text-blue-500' : 'bg-accent/10 text-accent'
                          } border border-transparent group-hover:border-current/20 transition-all`}>
                            {file.type === 'dir' ? <Folder className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                          </div>
                          <div>
                            <span className={`text-sm font-bold ${file.type === 'dir' ? 'text-text-primary group-hover:text-blue-500' : 'text-text-secondary group-hover:text-accent'} transition-colors`}>
                              {file.name}
                            </span>
                            {file.type === 'dir' && <p className="text-[10px] text-text-tertiary font-bold uppercase mt-0.5">Directory</p>}
                          </div>
                        </div>
                        {file.type !== 'dir' ? (
                          <span className="text-[11px] font-mono text-text-tertiary p-2 bg-secondary/30 rounded-lg">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        ) : (
                          <ChevronLeft className="w-4 h-4 text-text-tertiary rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
                        )}
                      </div>
                    ))}
                    {files.length === 0 && (
                      <div className="p-16 text-center space-y-4">
                        <UploadCloud className="w-12 h-12 text-text-tertiary mx-auto opacity-20" />
                        <p className="text-text-tertiary font-bold text-sm">Target path contains no recognizable entities.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - History */}
              <div className="w-96 space-y-8">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                    <History className="w-4 h-4 text-accent" />
                  </div>
                  <h3 className="text-text-primary font-black tracking-tight uppercase text-sm">Protocol Logs</h3>
                </div>
                
                <div className="space-y-4">
                  {commits.map(commit => (
                    <div key={commit.sha} className="card-styled p-6 hover:border-accent/30 transition-all group relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full pointer-events-none" />
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[8px] font-black">
                            {commit.commit.author.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[11px] font-black text-text-primary truncate max-w-[120px] uppercase tracking-widest">{commit.commit.author.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">{commit.sha.substring(0, 7)}</span>
                      </div>
                      <p className="text-sm text-text-secondary font-medium leading-relaxed italic border-l-2 border-border/50 pl-3">
                        {commit.commit.message}
                      </p>
                    </div>
                  ))}
                  {commits.length === 0 && (
                    <p className="text-xs text-text-tertiary font-bold uppercase tracking-widest text-center py-10">No recent logs available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal Overlay */}
      {showUpload && (
        <div className="fixed inset-0 bg-primary/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-sidebar border border-border rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/50 via-accent to-accent/50" />
            
            <div className="px-8 py-6 border-b border-border flex justify-between items-center text-left">
              <div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight">Synthesize New Asset</h2>
                <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-1">Direct Cloud Commitment</p>
              </div>
              <button onClick={() => setShowUpload(false)} className="w-10 h-10 flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-hover rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-text-tertiary ml-1">Asset Nomenclature (.txt, .md, .js)</label>
                <div className="flex items-center gap-3 bg-primary p-1 rounded-xl border border-border focus-within:border-accent transition-all group">
                   <span className="text-[11px] font-mono text-text-tertiary pl-4">/{currentPath ? currentPath + '/' : ''}</span>
                   <input
                    autoFocus
                    type="text"
                    placeholder="e.g. documentation.md"
                    className="bg-transparent flex-1 py-3 text-text-primary font-bold placeholder:text-text-tertiary/40 focus:outline-none"
                    value={uploadPath}
                    onChange={(e) => setUploadPath(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-text-tertiary ml-1">Core Content Boilerplate</label>
                  <button 
                    onClick={handleGenerateCommit} 
                    disabled={aiGenerating} 
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all font-black text-[10px] uppercase tracking-widest"
                  >
                    <Sparkles className={`w-3 h-3 ${aiGenerating ? 'animate-pulse' : ''}`} />
                    {aiGenerating ? 'AI Thinking...' : 'AI Message Helper'}
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    placeholder="// Initialize with logic or standard markdown..."
                    className="input-styled h-72 resize-none font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-accent"
                    value={uploadContent}
                    onChange={(e) => setUploadContent(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <button onClick={() => setShowUpload(false)} className="px-6 py-3 rounded-xl font-bold text-sm text-text-tertiary hover:text-text-primary transition-all">
                  Abort
                </button>
                <button 
                  onClick={handleUpload} 
                  disabled={uploading} 
                  className="btn-accent px-10 py-3 rounded-xl shadow-xl shadow-accent/20 flex items-center gap-3 transition-all transform active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-black uppercase tracking-widest text-xs">{uploading ? 'Transmitting...' : 'Commit to Cloud'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
