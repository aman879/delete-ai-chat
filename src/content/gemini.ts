// Content script for Gemini

const STORAGE_KEY_SELECTED = 'delete-ai-chat-selected-hrefs';
const STORAGE_KEY_BATCH_MODE = 'delete-ai-chat-batch-mode';

let selectedChatsHrefs = new Set<string>();
let batchModeEnabled = false;
let injectionInterval: number | null = null;

// Initialize state from sessionStorage
try {
  const storedBatchMode = sessionStorage.getItem(STORAGE_KEY_BATCH_MODE);
  if (storedBatchMode === 'true') {
    batchModeEnabled = true;
    const storedHrefs = sessionStorage.getItem(STORAGE_KEY_SELECTED);
    if (storedHrefs) {
      const parsed = JSON.parse(storedHrefs);
      if (Array.isArray(parsed)) {
        selectedChatsHrefs = new Set(parsed);
      }
    }
    // Wait a bit for DOM to be ready
    setTimeout(() => {
      startInjectionInterval();
      showFloatingButton();
    }, 500);
  }
} catch (e) {
  console.error('Error loading state', e);
}

function saveState() {
  sessionStorage.setItem(STORAGE_KEY_BATCH_MODE, batchModeEnabled ? 'true' : 'false');
  sessionStorage.setItem(STORAGE_KEY_SELECTED, JSON.stringify(Array.from(selectedChatsHrefs)));
}

function clearState() {
  batchModeEnabled = false;
  selectedChatsHrefs.clear();
  sessionStorage.removeItem(STORAGE_KEY_BATCH_MODE);
  sessionStorage.removeItem(STORAGE_KEY_SELECTED);
}

function toggleBatchMode(enabled: boolean) {
  batchModeEnabled = enabled;
  if (enabled) {
    saveState();
    startInjectionInterval();
    showFloatingButton();
  } else {
    clearState();
    stopInjectionInterval();
    removeCheckboxes();
    hideFloatingButton();
  }
}

function startInjectionInterval() {
  if (injectionInterval) return;
  injectCheckboxes();
  injectionInterval = window.setInterval(injectCheckboxes, 1000);
}

function stopInjectionInterval() {
  if (injectionInterval) {
    clearInterval(injectionInterval);
    injectionInterval = null;
  }
}

function getHistoryItems(): HTMLElement[] {
  // Find all a tags that link to chats and have standard material list item classes
  const containers = document.querySelectorAll('a[href*="/app/"][class*="list-item"], a[href*="/chat/"][class*="list-item"]');
  return Array.from(containers) as HTMLElement[];
}

function injectCheckboxes() {
  if (!batchModeEnabled) return;
  
  const items = getHistoryItems();
  
  items.forEach(item => {
    const href = item.getAttribute('href') || '';
    
    // Check if already injected
    if (item.querySelector('.delete-ai-chat-cb-wrapper')) {
      // Ensure checkbox state matches our set (in case it was re-rendered by SPA)
      const cb = item.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (cb && href) {
        const shouldBeChecked = selectedChatsHrefs.has(href);
        if (cb.checked !== shouldBeChecked) {
          cb.checked = shouldBeChecked;
          if (shouldBeChecked) {
            cb.style.backgroundColor = '#e11d48';
            cb.style.borderColor = '#e11d48';
          } else {
            cb.style.backgroundColor = 'transparent';
            cb.style.borderColor = '#52525b';
          }
        }
      }
      return;
    }
    
    const wrapper = document.createElement('div');
    wrapper.className = 'delete-ai-chat-cb-wrapper';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.marginRight = '8px';
    wrapper.style.zIndex = '9999';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.style.width = '18px';
    cb.style.height = '18px';
    cb.style.cursor = 'pointer';
    cb.style.accentColor = '#e11d48'; // Rose-600
    cb.style.borderRadius = '50%';
    cb.style.appearance = 'none';
    cb.style.border = '2px solid #52525b'; // Zinc-600
    cb.style.outline = 'none';
    
    if (href && selectedChatsHrefs.has(href)) {
      cb.checked = true;
      cb.style.backgroundColor = '#e11d48';
      cb.style.borderColor = '#e11d48';
    }
    
    cb.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        target.style.backgroundColor = '#e11d48';
        target.style.borderColor = '#e11d48';
        if (href) selectedChatsHrefs.add(href);
      } else {
        target.style.backgroundColor = 'transparent';
        target.style.borderColor = '#52525b';
        if (href) selectedChatsHrefs.delete(href);
      }
      saveState();
      updateFloatingButton();
    });

    wrapper.appendChild(cb);
    
    // Insert at the beginning of the item
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.insertBefore(wrapper, item.firstChild);
    
    // Prevent clicking checkbox from navigating
    wrapper.addEventListener('click', (e) => e.stopPropagation());
  });
}

function removeCheckboxes() {
  document.querySelectorAll('.delete-ai-chat-cb-wrapper').forEach(el => el.remove());
}

function showFloatingButton() {
  if (document.getElementById('delete-ai-chat-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'delete-ai-chat-btn';
  btn.innerText = `Delete Selected (${selectedChatsHrefs.size})`;
  btn.style.position = 'fixed';
  btn.style.bottom = '24px';
  btn.style.right = '24px';
  btn.style.padding = '12px 24px';
  btn.style.backgroundColor = '#e11d48'; // Rose-600
  btn.style.color = 'white';
  btn.style.border = 'none';
  btn.style.borderRadius = '9999px';
  btn.style.fontWeight = 'bold';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  btn.style.zIndex = '10000';
  btn.style.transition = 'all 0.2s';
  
  if (selectedChatsHrefs.size > 0) {
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
  } else {
    btn.style.opacity = '0.5';
    btn.style.pointerEvents = 'none';
  }

  btn.addEventListener('click', () => {
    deleteSelectedChats();
  });

  document.body.appendChild(btn);
}

function hideFloatingButton() {
  const btn = document.getElementById('delete-ai-chat-btn');
  if (btn) btn.remove();
}

function updateFloatingButton() {
  const btn = document.getElementById('delete-ai-chat-btn');
  if (btn) {
    btn.innerText = `Delete Selected (${selectedChatsHrefs.size})`;
    if (selectedChatsHrefs.size > 0) {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    } else {
      btn.style.opacity = '0.5';
      btn.style.pointerEvents = 'none';
    }
  }
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function deleteSelectedChats() {
  const btn = document.getElementById('delete-ai-chat-btn');
  if (btn) {
    btn.innerText = 'Deleting...';
    btn.style.opacity = '0.5';
    btn.style.pointerEvents = 'none';
  }

  // Iterate over a copy of the selected hrefs
  const hrefsToDelete = Array.from(selectedChatsHrefs);
  
  for (const href of hrefsToDelete) {
    try {
      // Find the current DOM element for this href
      const items = getHistoryItems();
      const item = items.find(el => el.getAttribute('href') === href);
      
      if (!item) {
        console.warn('Item not found in DOM for href:', href);
        continue; // Skip if not found, it might be on another page or already deleted
      }

      // 1. Find and click the 3-dot menu button for this item
      const parent = item.parentElement || item;
      const menuBtn = parent.querySelector('button[aria-haspopup="menu"], button[aria-label*="options" i], button[data-test-id="conversation-menu"]') as HTMLElement;
      
      if (menuBtn) {
        menuBtn.click();
        await sleep(150); // Fast wait for menu to open

        // 2. Find and click the Delete option
        const menuItems = document.querySelectorAll('menu-item, [role="menuitem"], .mat-mdc-menu-item, button');
        let deleteBtn: HTMLElement | null = null;
        
        for (const mi of Array.from(menuItems)) {
          const text = mi.textContent?.toLowerCase().trim() || '';
          if (text === 'delete' || text.includes('delete')) {
            if (mi.closest('.cdk-overlay-container, [role="menu"], mat-menu')) {
              deleteBtn = mi as HTMLElement;
              break;
            }
          }
        }

        if (deleteBtn) {
          deleteBtn.click();
          await sleep(150); // Fast wait for confirmation dialog

          // 3. Find and click Confirm
          const confirmBtns = document.querySelectorAll('button');
          for (const cb of Array.from(confirmBtns)) {
            const cbText = cb.textContent?.toLowerCase().trim() || '';
            if (cbText === 'delete' && cb.closest('dialog, .mat-mdc-dialog-container, [role="dialog"], .cdk-overlay-container')) {
              cb.click();
              break;
            }
          }
          
          await sleep(300); // Wait for deletion to complete before next
          
          selectedChatsHrefs.delete(href);
          saveState();
          updateFloatingButton();
        } else {
          console.warn('Delete button not found in menu for item', item);
          document.body.click();
          await sleep(300);
        }
      }
    } catch (e) {
      console.error('Error deleting chat:', e);
    }
  }

  // Done deleting
  clearState();
  hideFloatingButton();
  removeCheckboxes();
  stopInjectionInterval();
  
  // Inform popup that batch mode was turned off
  try {
    chrome.runtime.sendMessage({ type: 'BATCH_MODE_ENDED' });
  } catch(e) {
    // Ignore error if popup is not open
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'TOGGLE_BATCH_MODE') {
    toggleBatchMode(message.enabled);
    sendResponse({ success: true });
  } else if (message.type === 'GET_STATE') {
    sendResponse({ isBatchMode: batchModeEnabled });
  }
});
