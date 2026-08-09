import { useState, useEffect } from 'react';
import Modal from './Modal';
import { 
  Save, 
  Trash2, 
  UserPlus, 
  Flag, 
  Calendar,
  Type,
  AlignLeft
} from 'lucide-react';

export default function EditTaskModal({ isOpen, onClose, task, onSubmit, onAssign, onDelete }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'MEDIUM');
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setAssigneeId(task.assigneeId || '');
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onSubmit(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assigneeId.trim()) return;
    try {
      await onAssign(task.id, { assigneeId: assigneeId.trim() });
    } catch (err) {
      console.error(err);
    }
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modify Task">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1 flex items-center gap-2">
            <Type className="w-3 h-3" /> Title
          </label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="input-styled font-bold" 
            required 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1 flex items-center gap-2">
            <AlignLeft className="w-3 h-3" /> Description
          </label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="input-styled resize-none h-28 py-4 font-medium" 
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1 flex items-center gap-2">
              <Flag className="w-3 h-3" /> Priority
            </label>
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)} 
              className="input-styled font-bold text-sm bg-secondary appearance-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Deadline
            </label>
            <input 
              type="date" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
              className="input-styled text-sm font-bold" 
            />
          </div>
        </div>

        {/* Assign Section */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1 flex items-center gap-2">
            <UserPlus className="w-3 h-3" /> Ownership
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={assigneeId} 
              onChange={(e) => setAssigneeId(e.target.value)} 
              placeholder="Assignee User ID" 
              className="input-styled flex-1" 
            />
            <button 
              type="button" 
              onClick={handleAssign} 
              className="px-6 py-3 bg-secondary hover:bg-hover text-text-primary border border-border rounded-xl font-bold text-xs transition-all"
            >
              Assign
            </button>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-border/50">
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 btn-accent py-4 rounded-2xl shadow-xl shadow-accent/10 flex items-center justify-center gap-2 group transition-all"
          >
            <Save className={`w-5 h-5 ${loading ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
            <span className="font-black uppercase tracking-widest text-sm">
              {loading ? 'Commiting...' : 'Save Updates'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => { onDelete(task.id); onClose(); }}
            className="px-5 py-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-2xl transition-all duration-300 flex items-center justify-center group"
            title="Delete Task"
          >
            <Trash2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </form>
    </Modal>
  );
}
