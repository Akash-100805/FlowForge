import { useState } from 'react';
import Modal from './Modal';
import { Rocket } from 'lucide-react';

export default function CreateProjectModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined });
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Initialize Project">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Project Identity</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Apollo Mission"
            className="input-styled"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Strategy & Vision</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline the core objectives and scope..."
            className="input-styled resize-none h-32 py-4"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !name.trim()} 
          className="w-full btn-accent py-4 rounded-2xl shadow-xl shadow-accent/10 flex items-center justify-center gap-2 group transition-all mt-4"
        >
          <Rocket className={`w-5 h-5 ${loading ? 'animate-bounce' : 'group-hover:-translate-y-1 transition-transform'}`} />
          <span className="font-black uppercase tracking-widest text-sm">
            {loading ? 'Igniting...' : 'Create Workspace'}
          </span>
        </button>
      </form>
    </Modal>
  );
}
