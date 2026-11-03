import { useState, useEffect } from 'react';
import { Trash } from '@phosphor-icons/react';
import { Header } from './components/Header';
import { Toast } from './components/Toast';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Fetch initial batch mode state and listen for updates
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.runtime) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_STATE' }, (response) => {
            if (!chrome.runtime.lastError && response) {
              setIsBatchMode(response.isBatchMode);
            }
          });
        }
      });
      
      const messageListener = (message: any) => {
        if (message.type === 'BATCH_MODE_ENDED') {
          setIsBatchMode(false);
        }
      };
      
      chrome.runtime.onMessage.addListener(messageListener);
      return () => {
        chrome.runtime.onMessage.removeListener(messageListener);
      };
    }
  }, []);

  const toggleBatchMode = () => {
    const newState = !isBatchMode;
    setIsBatchMode(newState);
    
    // Send message to content script
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_BATCH_MODE', enabled: newState }, (response) => {
            if (chrome.runtime.lastError) {
              console.log('Error sending message to content script:', chrome.runtime.lastError);
              setToastMsg('Error: Open Gemini to use this feature.');
              setIsBatchMode(false);
            } else if (response && response.success) {
              setToastMsg(newState ? 'Batch Delete Enabled' : 'Batch Delete Disabled');
            }
          });
        }
      });
    } else {
      setToastMsg('Batch Delete toggled (dev mode)');
    }
  };

  return (
    <div className="w-[400px] min-h-[300px] flex flex-col bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 transition-colors duration-150">
      <Toast message={toastMsg} />
      
      <Header 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
      />

      <div className="flex-1 p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Batch Cleanup</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enable batch mode to add selection checkboxes to your AI chat history list, allowing you to bulk delete conversations in one click.
          </p>
        </div>
        
        <div className="mt-auto">
          <button
            onClick={toggleBatchMode}
            className={`w-full py-2.5 px-4 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 border ${
              isBatchMode 
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600' 
                : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 border-transparent'
            }`}
          >
            <Trash weight="bold" className="w-4 h-4" />
            {isBatchMode ? 'Disable Batch Delete' : 'Enable Batch Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
