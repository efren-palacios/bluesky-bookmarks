let localBookmarks = {};

function isExtensionContextValid() {
  return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
}

function initializeExtension() {
  if (!isExtensionContextValid()) {
    console.log('Extension context invalid. Retrying in 1 second...');
    setTimeout(initializeExtension, 1000);
    return;
  }

  console.log('Initializing extension...');
  // Load bookmarks from storage
  chrome.runtime.sendMessage({ action: "getBookmarks" }, (bookmarks) => {
    localBookmarks = bookmarks || {};
    console.log('Loaded bookmarks:', localBookmarks);
    setupMutationObserver();
    addBookmarksMenuItem();
  });

  // Set up event delegation for bookmark clicks
  document.body.addEventListener('click', handleBookmarkClick);
}

function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      for (let node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const posts = node.querySelectorAll('[data-testid^="postThreadItem-"]');
          posts.forEach(addBookmarkButton);
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function addBookmarkButton(post) {
  const postId = post.getAttribute('data-testid').split('-')[1];
  const authorHandle = post.querySelector('a[href^="/profile/"]')?.getAttribute('href')?.split('/').pop();
  const uniqueId = `${authorHandle}-${postId}`;

  if (!post.querySelector(`.bookmark-btn-${uniqueId}`)) {
    const interactionsBar = post.querySelector('.css-175oi2r[style*="flex-direction: row; justify-content: space-between; align-items: center;"]');
    if (interactionsBar) {
      const bookmarkBtn = createBookmarkButton(uniqueId);
      interactionsBar.insertBefore(bookmarkBtn, interactionsBar.lastElementChild);
      updateBookmarkButton(bookmarkBtn, !!localBookmarks[uniqueId]);
    }
  }
}

function createBookmarkButton(uniqueId) {
  const bookmarkBtn = document.createElement('div');
  bookmarkBtn.className = `css-175oi2r bookmark-btn bookmark-btn-${uniqueId}`;
  bookmarkBtn.style.cssText = 'align-items: center;';
  bookmarkBtn.innerHTML = `
    <div aria-label="Bookmark" tabindex="0" class="css-175oi2r r-1loqt21 r-1otgn73" style="gap: 4px; border-radius: 999px; flex-direction: row; justify-content: center; align-items: center; overflow: hidden; padding: 5px;">
      <svg fill="none" width="22" viewBox="0 0 24 24" height="22" style="color: rgb(120, 142, 165);">
        <path fill="currentColor" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
      </svg>
    </div>
  `;
  bookmarkBtn.setAttribute('data-unique-id', uniqueId);
  return bookmarkBtn;
}

function handleBookmarkClick(event) {
  const bookmarkBtn = event.target.closest('.bookmark-btn');
  if (!bookmarkBtn) return;

  event.preventDefault();
  event.stopPropagation();

  const uniqueId = bookmarkBtn.getAttribute('data-unique-id');
  toggleBookmark(uniqueId, bookmarkBtn);
}

function toggleBookmark(uniqueId, bookmarkBtn) {
  if (!isExtensionContextValid()) {
    console.error('Extension context invalidated. Please refresh the page.');
    showToast('Extension error. Please refresh the page.');
    return;
  }

  const post = bookmarkBtn.closest('[data-testid^="postThreadItem-"]');
  const contentElement = post.querySelector('[data-word-wrap="1"]') || 
                         post.querySelector('.css-1xnzce8') ||
                         post.querySelector('[style*="font-size: 18.75px"]');
  
  const postContent = contentElement ? contentElement.textContent.trim() : 'No content available';
  
  const authorElement = post.querySelector('a[href^="/profile/"]');
  const avatar = post.querySelector('img[draggable="false"]');

  // Get the URL from the og:url meta tag
  const ogUrlMeta = document.querySelector('meta[property="og:url"]');
  const postUrl = ogUrlMeta ? ogUrlMeta.getAttribute('content') : '';

  const bookmarkData = {
    content: postContent,
    date: new Date().toISOString(),
    displayName: authorElement ? authorElement.textContent.trim() : 'Unknown User',
    handle: authorElement ? authorElement.getAttribute('href').split('/').pop() : 'unknown',
    avatar: avatar ? avatar.src : '',
    url: postUrl // Add the URL to the bookmark data
  };

  chrome.runtime.sendMessage({ action: "getBookmarks" }, (bookmarks) => {
    if (chrome.runtime.lastError) {
      console.error('Error getting bookmarks:', chrome.runtime.lastError);
      showToast('Error retrieving bookmarks. Please refresh the page.');
      return;
    }

    const updatedBookmarks = { ...bookmarks };
    if (updatedBookmarks[uniqueId]) {
      delete updatedBookmarks[uniqueId];
      showToast('Bookmark removed');
    } else {
      updatedBookmarks[uniqueId] = bookmarkData;
      showToast('Bookmark added');
    }

    chrome.runtime.sendMessage({ action: "setBookmarks", bookmarks: updatedBookmarks }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error setting bookmarks:', chrome.runtime.lastError);
        showToast('Error saving bookmark. Please refresh the page.');
        return;
      }
      if (response && response.success) {
        localBookmarks = updatedBookmarks;
        updateBookmarkButton(bookmarkBtn, !!updatedBookmarks[uniqueId]);
      } else {
        showToast('Error saving bookmark. Please try again.');
      }
    });
  });
}

function updateBookmarkButton(button, isBookmarked) {
  const svg = button.querySelector('svg');
  if (isBookmarked) {
    svg.style.color = 'rgb(32, 139, 254)'; // Blue color
  } else {
    svg.style.color = 'rgb(120, 142, 165)'; // Original color
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function addBookmarksMenuItem() {
  if (!isExtensionContextValid()) return;
  const sidebarNav = document.querySelector('.css-175oi2r.r-c4unlt.r-pgf20v.r-1rnoaur.r-1xcajam.r-1ki14p2.r-1w88a7h');
  if (sidebarNav && !document.querySelector('#bookmarks-menu-item')) {
    const bookmarksMenuItem = createBookmarksMenuItem();
    // Insert the Bookmarks menu item before the Settings menu item
    const settingsMenuItem = sidebarNav.querySelector('a[href="/settings"]');
    if (settingsMenuItem) {
      sidebarNav.insertBefore(bookmarksMenuItem, settingsMenuItem);
    } else {
      sidebarNav.appendChild(bookmarksMenuItem);
    }
  }
}

function createBookmarksMenuItem() {
  const bookmarksMenuItem = document.createElement('a');
  bookmarksMenuItem.id = 'bookmarks-menu-item';
  bookmarksMenuItem.href = '#';
  bookmarksMenuItem.setAttribute('aria-label', 'Bookmarks');
  bookmarksMenuItem.setAttribute('role', 'tab');
  bookmarksMenuItem.setAttribute('data-no-underline', '1');
  bookmarksMenuItem.setAttribute('tabindex', '0');
  bookmarksMenuItem.className = 'css-175oi2r r-1loqt21 r-1otgn73';
  bookmarksMenuItem.style.cssText = 'flex-direction: row; align-items: center; padding: 12px; border-radius: 8px; gap: 8px;';
  
  bookmarksMenuItem.innerHTML = `
    <div class="css-175oi2r" style="align-items: center; justify-content: center; z-index: 10; width: 24px; height: 24px;">
      <svg fill="none" width="28" viewBox="0 0 24 24" height="28" style="color: rgb(241, 243, 245);">
        <path fill="hsl(211, 20%, 95.3%)" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
      </svg>
    </div>
    <div dir="auto" class="css-146c3p1" style="font-size: 18.75px; letter-spacing: 0.25px; color: rgb(241, 243, 245); font-weight: 400; line-height: 18.75px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';">Bookmarks</div>
  `;

  bookmarksMenuItem.addEventListener('click', (e) => {
    e.preventDefault();
    if (isExtensionContextValid()) {
      chrome.runtime.sendMessage({ action: "openBookmarksPage" });
    } else {
      console.error('Extension context invalidated. Please refresh the page.');
      showToast('Extension error. Please refresh the page.');
    }
  });

  return bookmarksMenuItem;
}

// Initialize the extension
initializeExtension();
