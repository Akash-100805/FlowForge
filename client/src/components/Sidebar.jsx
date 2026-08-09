import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutTemplate, 
  SquarePlus, 
  LayoutDashboard, 
  StickyNote, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  GitBranch
} from 'lucide-react';
import { useTheme } from '../context/themeContext';

export default function Sidebar({ onNewProject }) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const { theme, toggleTheme } = useTheme();

  const userName = (() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 'User';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.name || payload.email || 'User';
    } catch { return 'User'; }
  })();

  const isBoard = path.includes('/board');
  const isNotes = path.includes('/notes');
  const isDashboard = path === '/dashboard';
  const isGithub = path.includes('/github');

  const projectId = path.split('/project/')[1]?.split('/')[0];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/dashboard', 
      active: isDashboard 
    },
    { 
      label: 'Board', 
      icon: LayoutTemplate, 
      path: projectId ? `/project/${projectId}/board` : '/dashboard', 
      active: isBoard,
      disabled: !projectId && !isDashboard
    },
    { 
      label: 'Notes', 
      icon: StickyNote, 
      path: projectId ? `/project/${projectId}/notes` : null, 
      active: isNotes,
      hidden: !projectId
    },
    { 
      label: 'GitHub', 
      icon: GitBranch, 
      path: projectId ? `/project/${projectId}/github` : null, 
      active: isGithub,
      hidden: !projectId
    }
  ];

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-border flex flex-col fixed left-0 top-0 z-40 transition-colors duration-300">
      {/* Logo */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-text-primary font-bold text-xl tracking-tight leading-none">FlowForge</h1>
            <p className="text-[10px] tracking-widest text-text-tertiary uppercase mt-1 font-semibold">Plan. Build. Ship.</p>
          </div>
        </div>
      </div>

      {/* New Project Button */}
      <div className="px-4 mb-8">
        <button
          onClick={onNewProject || (() => navigate('/dashboard'))}
          className="w-full btn-accent py-3 flex items-center justify-center gap-2 rounded-xl"
        >
          <SquarePlus className="w-5 h-5" />
          <span className="text-sm">New Project</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          !item.hidden && (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                item.active 
                  ? 'bg-accent/10 text-accent' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-hover'
              } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${item.active ? 'text-accent' : 'text-text-tertiary group-hover:text-text-primary'}`} />
              {item.label}
            </button>
          )
        ))}

        <div className="pt-4 mt-4 border-t border-border">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-hover transition-all duration-200 group">
            <Settings className="w-5 h-5 text-text-tertiary group-hover:text-text-primary" />
            Settings
          </button>
          
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-hover transition-all duration-200 group"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-5 h-5 text-text-tertiary group-hover:text-text-primary" />
                Dark Mode
              </>
            ) : (
              <>
                <Sun className="w-5 h-5 text-text-tertiary group-hover:text-text-primary" />
                Light Mode
              </>
            )}
          </button>
        </div>
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-border bg-secondary/30">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-primary/50 border border-border/50">
          <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-inner">
            <span className="text-sm font-bold uppercase">{userName.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-primary truncate leading-tight">{userName}</p>
            <p className="text-[11px] text-text-tertiary font-medium">Project Lead</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-text-tertiary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
