import { useState } from 'react';
import Modal from './Modal';
import { UserPlus } from 'lucide-react';

export default function InviteMemberModal({ isOpen, onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      await onSubmit({ email: email.trim() });
      setMessage('success:Member invited successfully!');
      setEmail('');
      setTimeout(() => { setMessage(''); onClose(); }, 1500);
    } catch (err) {
      setMessage(`error:${err.response?.data?.error || 'Failed to invite member'}`);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.startsWith('success:');
  const displayMessage = message.replace(/^(success|error):/, '');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Expand Team">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Team Member Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@flowforge.com"
            className="input-styled"
            required
          />
        </div>
        
        {message && (
          <div className={`p-4 rounded-xl text-sm font-bold border animate-scale-in ${
            isSuccess ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
          }`}>
            {displayMessage}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || !email.trim()} 
          className="w-full btn-accent py-4 rounded-2xl shadow-xl shadow-accent/10 flex items-center justify-center gap-2 group transition-all"
        >
          <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-black uppercase tracking-widest text-sm">
            {loading ? 'Sending Invite...' : 'Send Invitation'}
          </span>
        </button>
      </form>
    </Modal>
  );
}
