import { 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  User
} from 'lucide-react';

const priorityColors = {
  HIGH: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', label: 'High Priority' },
  MEDIUM: { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/20', label: 'Medium' },
  LOW: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20', label: 'Low' },
  URGENT: { bg: 'bg-red-600/20', text: 'text-red-600', border: 'border-red-600/30', label: 'Urgent' },
};

export default function TaskCard({ task, onEdit, onDelete, onMoveLeft, onMoveRight, showMoveLeft, showMoveRight }) {
  const priority = priorityColors[task.priority] || priorityColors.MEDIUM;

  return (
    <div className="card-styled p-5 hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/5 hover:border-accent/30 group cursor-pointer animate-fade-in relative transition-all duration-300">
      {/* Task Content */}
      <div className="flex items-start justify-between mb-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase border ${priority.bg} ${priority.text} ${priority.border}`}>
          {priority.label}
        </span>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(task); }} 
            className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
            className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <h3 className="text-sm font-bold text-text-primary mb-2 leading-snug group-hover:text-accent transition-colors">
        {task.title}
      </h3>
      
      {task.description && (
        <p className="text-xs text-text-secondary mb-4 line-clamp-2 leading-relaxed font-medium">
          {task.description}
        </p>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-3">
          {task.assigneeId ? (
            <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center border border-primary shadow-sm" title="Assignee">
              <User className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center border border-border/50 text-text-tertiary" title="Unassigned">
              <User className="w-3.5 h-3.5 opacity-50" />
            </div>
          )}
          
          {task.dueDate && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-tertiary">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>

        <div className="flex gap-1">
          {showMoveLeft && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMoveLeft(task); }} 
              className="w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-accent bg-secondary/50 hover:bg-accent/10 rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {showMoveRight && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMoveRight(task); }} 
              className="w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-accent bg-secondary/50 hover:bg-accent/10 rounded-lg transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
