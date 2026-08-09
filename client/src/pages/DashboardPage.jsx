import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Archive, 
  RotateCcw, 
  MoreVertical, 
  Users, 
  ArrowRight,
  FolderOpen
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import CreateProjectModal from '../components/CreateProjectModal';
import InviteMemberModal from '../components/InviteMemberModal';
import { getProjects, createProject, inviteMember, archiveProject, unarchiveProject } from '../services/projectService';

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (data) => {
    await createProject(data);
    fetchProjects();
  };

  const handleInvite = async (data) => {
    await inviteMember(selectedProjectId, data);
  };

  const handleArchive = async (projectId) => {
    try {
      await archiveProject(projectId);
      fetchProjects();
      setMenuOpen(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnarchive = async (projectId) => {
    try {
      await unarchiveProject(projectId);
      fetchProjects();
      setMenuOpen(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProjects = projects.filter(p => {
    const isStatusMatch = activeTab === 'active' ? p.status !== 'ARCHIVED' : p.status === 'ARCHIVED';
    const isSearchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return isStatusMatch && isSearchMatch;
  });

  return (
    <div className="min-h-screen bg-primary">
      <Sidebar onNewProject={() => setShowCreateModal(true)} />

      <main className="ml-64 p-10 animate-fade-in">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-text-primary tracking-tight mb-2">
              FlowForge
            </h1>
            <p className="text-text-secondary font-medium">
              Here you can create and manage your projects.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="w-4 h-4 text-text-tertiary absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="input-styled pl-11 py-2.5 w-72 shadow-sm"
              />
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-accent px-5 py-2.5 rounded-xl shadow-lg shadow-accent/20"
            >
              <Plus className="w-5 h-5" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-border pb-1">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 text-sm font-bold transition-all relative ${
              activeTab === 'active' ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Active Projects
            {activeTab === 'active' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-accent rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('archived')}
            className={`px-6 py-3 text-sm font-bold transition-all relative ${
              activeTab === 'archived' ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Archived Projects
            {activeTab === 'archived' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-accent rounded-full" />}
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
            <p className="text-text-tertiary font-medium animate-pulse">Loading workspace...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {activeTab === 'active' && searchQuery === '' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="card-styled border-dashed border-2 border-border/60 hover:border-accent/40 bg-secondary/20 p-8 flex flex-col items-center justify-center min-h-[240px] group transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary group-hover:bg-accent/10 flex items-center justify-center mb-4 transition-all duration-300">
                  <Plus className="w-8 h-8 text-text-tertiary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-text-primary font-bold mb-1">Create New Project</h3>
                <p className="text-text-tertiary text-xs text-center px-4 leading-relaxed">
                  Initialize a new workspace with custom stages and team members.
                </p>
              </button>
            )}

            {filteredProjects.length === 0 && (searchQuery !== '' || activeTab === 'archived') ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center bg-secondary/10 rounded-3xl border border-dashed border-border/50 text-text-tertiary">
                <FolderOpen className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium">No projects found in this section.</p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}/board`)}
                  className="card-styled card-hoverable p-8 flex flex-col justify-between min-h-[240px] group relative cursor-pointer overflow-hidden shadow-sm"
                >
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full pointer-events-none" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className={`text-[11px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg border ${
                        project.status === 'ARCHIVED' 
                          ? 'bg-secondary text-text-tertiary border-border' 
                          : 'bg-accent/10 text-accent border-accent/20'
                      }`}>
                        {project.status || 'Active'}
                      </span>
                      
                      <div className="relative">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setMenuOpen(menuOpen === project.id ? null : project.id); 
                          }}
                          className="w-9 h-9 flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-hover rounded-xl transition-all"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {menuOpen === project.id && (
                          <div className="absolute right-0 top-11 bg-sidebar border border-border rounded-2xl shadow-2xl py-2 w-48 z-10 animate-scale-in">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProjectId(project.id);
                                setShowInviteModal(true);
                                setMenuOpen(null);
                              }}
                              className="w-full text-left px-5 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-hover transition-colors flex items-center gap-2"
                            >
                              <Users className="w-4 h-4" />
                              Invite Member
                            </button>
                            
                            {project.status === 'ARCHIVED' ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUnarchive(project.id); }}
                                className="w-full text-left px-5 py-3 text-sm text-accent hover:text-accent-active hover:bg-hover transition-colors flex items-center gap-2"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Unarchive
                              </button>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleArchive(project.id); }}
                                className="w-full text-left px-5 py-3 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/5 transition-colors flex items-center gap-2"
                              >
                                <Archive className="w-4 h-4" />
                                Archive Project
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-black text-text-primary mb-3 group-hover:text-accent transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed font-medium">
                      {project.description || 'Seamlessly organizing collaborative workflows.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center border-2 border-primary shadow-sm font-black text-[10px]">
                        {(project.name || 'P').charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <button
                      className="text-accent group-hover:text-accent-hover text-sm font-bold flex items-center gap-2 transition-all group-hover:gap-3"
                    >
                      View Board <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <CreateProjectModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handleCreateProject} />
      <InviteMemberModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} onSubmit={handleInvite} />
    </div>
  );
}

