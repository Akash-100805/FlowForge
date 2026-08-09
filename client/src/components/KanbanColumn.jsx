import { useState } from 'react';
import TaskCard from './TaskCard';
import { 
  MoreHorizontal, 
  Plus, 
  GripVertical 
} from 'lucide-react';

export default function KanbanColumn({ 
  stage, 
  tasks, 
  stageIndex, 
  totalStages, 
  stages, 
  onAddTask, 
  onEditTask, 
  onDeleteTask, 
  onMoveTask, 
  onRenameStage 
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(stage.name);

  const columnTasks = tasks.filter(t => t.stageId === stage.id);

  const handleRename = () => {
    if (newName.trim() && newName.trim() !== stage.name) {
      onRenameStage(stage.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleMoveLeft = (task) => {
    const prevStage = stages[stageIndex - 1];
    if (prevStage) onMoveTask(task.id, prevStage.id);
  };

  const handleMoveRight = (task) => {
    const nextStage = stages[stageIndex + 1];
    if (nextStage) onMoveTask(task.id, nextStage.id);
  };

  return (
    <div className="flex-shrink-0 w-80 flex flex-col group/column h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-text-tertiary opacity-0 group-hover/column:opacity-100 transition-opacity cursor-grab" />
          {isRenaming ? (
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="bg-secondary border border-accent/50 rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none w-44 shadow-inner shadow-black/5"
            />
          ) : (
            <h3
              className="text-sm font-black text-text-primary tracking-wide cursor-pointer hover:text-accent transition-colors"
              onDoubleClick={() => setIsRenaming(true)}
            >
              {stage.name}
            </h3>
          )}
          <span className="bg-secondary text-text-tertiary text-[11px] font-black px-2.5 py-0.5 rounded-full border border-border/50">
            {columnTasks.length}
          </span>
        </div>
        <button
          onClick={() => setIsRenaming(true)}
          className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-hover rounded-lg transition-all"
          title="Rename stage"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Accent Header Line */}
      <div className="h-1 bg-gradient-to-r from-accent to-accent/5 rounded-full mb-6 mx-2 opacity-80" />

      {/* Cards Container */}
      <div className="space-y-4 px-2 min-h-[500px] flex-1">
        {columnTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
            showMoveLeft={stageIndex > 0}
            showMoveRight={stageIndex < totalStages - 1}
          />
        ))}

        {/* Empty state placeholder if no tasks */}
        {columnTasks.length === 0 && (
          <div className="py-12 border-2 border-dashed border-border/30 rounded-2xl flex flex-col items-center justify-center text-text-tertiary/50">
            <Plus className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No Tasks</p>
          </div>
        )}

        {/* Add Task Button at bottom of list */}
        <button
          onClick={() => onAddTask(stage.id)}
          className="w-full mt-2 py-4 border-2 border-dashed border-border/40 rounded-2xl text-xs font-black uppercase tracking-widest text-text-tertiary hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          <Plus className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />
          Add Task
        </button>
      </div>
    </div>
  );
}
