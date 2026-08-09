import { useState } from 'react';
import Modal from './Modal';
import { PlusCircle, Calendar, Flag } from 'lucide-react';

export default function CreateTaskModal({ isOpen, onClose, onSubmit, stageId }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        stageId: stageId || undefined,
      });
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setDueDate('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Assignment">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Task Nomenclature</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="What needs to be done?" 
            className="input-styled" 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Context & Details</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Add some depth to the task..." 
            className="input-styled resize-none h-24 py-4" 
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

        <button 
          type="submit" 
          disabled={loading || !title.trim()} 
          className="w-full btn-accent py-4 rounded-2xl shadow-xl shadow-accent/10 flex items-center justify-center gap-2 group transition-all mt-2"
        >
          <PlusCircle className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-90 transition-transform'}`} />
          <span className="font-black uppercase tracking-widest text-sm">
            {loading ? 'Propagating...' : 'Log Task'}
          </span>
        </button>
      </form>
    </Modal>
  );
}
