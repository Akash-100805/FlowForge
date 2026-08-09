import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-primary/60 backdrop-blur-md transition-all duration-500" onClick={onClose} />
      <div className="relative bg-sidebar border border-border rounded-3xl p-8 w-full max-w-lg animate-scale-in shadow-2xl shadow-black/20 overflow-hidden">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/50 via-accent to-accent/50" />
        
        <div className="flex items-center justify-between mb-8 text-left">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">{title}</h2>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-hover rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
