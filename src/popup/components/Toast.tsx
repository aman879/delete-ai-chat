interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;
  
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="bg-zinc-800 dark:bg-zinc-200 text-zinc-50 dark:text-zinc-900 px-4 py-2 rounded-md shadow-lg text-sm font-medium flex items-center gap-2 border border-zinc-700 dark:border-zinc-300">
        {message}
      </div>
    </div>
  );
}
