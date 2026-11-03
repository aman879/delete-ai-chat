import { Trash, Sun, Moon } from '@phosphor-icons/react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({ isDarkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-white/10 shrink-0">
      <div className="flex items-center gap-2">
        <Trash size={24} weight="fill" className="text-zinc-950 dark:text-zinc-50" />
        <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">Delete AI Chat</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleDarkMode}
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Toggle theme"
        >
          {isDarkMode ? <Sun size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
        </button>
      </div>
    </div>
  );
}
