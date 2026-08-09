import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Users, 
  Plus, 
  Settings, 
  GitBranch, 
  StickyNote, 
  LayoutTemplate,
  Calendar,
  CheckCircle2,
  Trash2,
  MoreVertical
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import KanbanColumn from '../components/KanbanColumn';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import InviteMemberModal from '../components/InviteMemberModal';
import { getTasks, createTask, updateTask, moveTask, assignTask, deleteTask } from '../services/taskService';
import { addStage, renameStage, getStages } from '../services/stageService';
import { inviteMember } from '../services/projectService';
import { connectSocket, joinProject, leaveProject, getSocket } from '../socket/socket';

export default function BoardPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showAddStage, setShowAddStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [activeStageId, setActiveStageId] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await getTasks(projectId);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchStages = useCallback(async () => {
    try {
      const res = await getStages(projectId);
      setStages(res.data);
    } catch (err) {
      console.error('Failed to fetch stages:', err);
    }
  }, [projectId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchTasks(), fetchStages()]);

    const socket = connectSocket();
    joinProject(projectId);

    socket.on('task:created', (task) => {
      setTasks(prev => [...prev, task]);
      if (task.stage) {
        setStages(prev => {
          const exists = prev.find(s => s.id === task.stage.id);
          if (!exists) return [...prev, task.stage].sort((a, b) => a.orderIndex - b.orderIndex);
          return prev;
        });
      }
    });

    socket.on('task:updated', (updatedTask) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    });

    socket.on('task:moved', ({ taskId, newStageId }) => {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, stageId: newStageId } : t));
    });

    socket.on('task:deleted', ({ taskId }) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    });

    return () => {
      leaveProject(projectId);
      const s = getSocket();
      if (s) {
        s.off('task:created');
        s.off('task:updated');
        s.off('task:moved');
        s.off('task:deleted');
      }
    };
  }, [projectId, fetchTasks, fetchStages]);

  const handleCreateTask = async (data) => {
    await createTask(projectId, data);
    await fetchStages();
  };

  const handleUpdateTask = async (taskId, data) => {
    const res = await updateTask(taskId, data);
    setTasks(prev => prev.map(t => t.id === taskId ? res.data : t));
  };

  const handleMoveTask = async (taskId, newStageId) => {
    try {
      await moveTask(taskId, { newStageId });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, stageId: newStageId } : t));
    } catch (err) {
      alert(err.response?.data?.error || 'Move failed');
    }
  };

  const handleAssignTask = async (taskId, data) => {
    const res = await assignTask(taskId, data);
    setTasks(prev => prev.map(t => t.id === taskId ? res.data : t));
  };

  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleRenameStage = async (stageId, name) => {
    try {
      await renameStage(stageId, { name });
      setStages(prev => prev.map(s => s.id === stageId ? { ...s, name } : s));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStage = async () => {
    if (!newStageName.trim()) return;
    try {
      const res = await addStage(projectId, { name: newStageName.trim() });
      setStages(prev => [...prev, res.data].sort((a, b) => a.orderIndex - b.orderIndex));
      setNewStageName('');
      setShowAddStage(false);
    } catch (err) {
      console.error(err);
    }
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
                <h2 className="text-xl font-black text-text-primary tracking-tight">Project Board</h2>
              </div>
              
              <nav className="flex items-center gap-2">
                {[
                  { label: 'Board', icon: LayoutTemplate, path: `/project/${projectId}/board`, active: true },
                  { label: 'Notes', icon: StickyNote, path: `/project/${projectId}/notes` },
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

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowInvite(true)} 
                className="btn-accent px-5 py-2.5 rounded-xl shadow-lg shadow-accent/20 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Invite Team</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary hover:bg-hover text-text-tertiary hover:text-text-primary transition-all border border-border/50">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Board View */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
            <p className="text-text-tertiary font-bold animate-pulse">Syncing board...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto p-10 custom-scrollbar bg-primary/30">
            <div className="flex gap-8 min-h-full items-start">
              {stages.map((stage, idx) => (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  tasks={tasks}
                  stageIndex={idx}
                  totalStages={stages.length}
                  stages={stages}
                  onAddTask={(stageId) => { setActiveStageId(stageId); setShowCreateTask(true); }}
                  onEditTask={(task) => { setEditingTask(task); setShowEditTask(true); }}
                  onDeleteTask={handleDeleteTask}
                  onMoveTask={handleMoveTask}
                  onRenameStage={handleRenameStage}
                />
              ))}

              {/* Add Stage Pillar */}
              <div className="flex-shrink-0 w-80">
                {showAddStage ? (
                  <div className="card-styled p-6 animate-scale-in border-accent/30 bg-secondary/50">
                    <input
                      autoFocus
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
                      placeholder="New stage name"
                      className="input-styled mb-4 font-bold text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <button onClick={handleAddStage} className="btn-accent flex-1 py-2.5 rounded-lg text-xs">Add Stage</button>
                      <button onClick={() => { setShowAddStage(false); setNewStageName(''); }} className="px-4 py-2.5 text-text-tertiary hover:text-text-primary font-bold text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddStage(true)}
                    className="w-full py-16 border-2 border-dashed border-border/40 rounded-3xl text-text-tertiary hover:text-accent hover:border-accent/30 bg-secondary/10 hover:bg-accent/5 transition-all duration-300 font-black text-xs uppercase tracking-widest flex flex-col items-center gap-3 group"
                  >
                    <Plus className="w-8 h-8 group-hover:scale-125 transition-transform" />
                    New Stage
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Status */}
        <div className="px-8 py-3 border-t border-border bg-sidebar/30 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Everything up to date
            </p>
            <div className="h-3 w-px bg-border" />
            <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
              {tasks.length} Active Tasks
            </p>
          </div>
          <p className="text-[11px] font-black text-accent uppercase tracking-widest animate-pulse">
            FlowForge Engine Active
          </p>
        </div>
      </main>

      <CreateTaskModal isOpen={showCreateTask} onClose={() => { setShowCreateTask(false); setActiveStageId(null); }} onSubmit={handleCreateTask} stageId={activeStageId} />
      <EditTaskModal isOpen={showEditTask} onClose={() => { setShowEditTask(false); setEditingTask(null); }} task={editingTask} onSubmit={handleUpdateTask} onAssign={handleAssignTask} onDelete={handleDeleteTask} />
      <InviteMemberModal isOpen={showInvite} onClose={() => setShowInvite(false)} onSubmit={(data) => inviteMember(projectId, data)} />
    </div>
  );
}
