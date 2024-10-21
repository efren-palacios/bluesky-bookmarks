let localBookmarks = {};

// At the beginning of the file, add:
const extensionPrefix = 'bsky-bookmarker-';

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
    
    // Check for existing posts and add bookmark buttons
    checkAndAddBookmarkButton(document.body);
    
    setupMutationObserver();
    addBookmarksMenuItem();
  });

  // Set up event delegation for bookmark clicks
  document.body.addEventListener('click', handleBookmarkClick);
}

function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            checkAndAddBookmarkButton(node);
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function checkAndAddBookmarkButton(node) {
  // Check if the node itself is a post or contains posts
  const posts = [node, ...node.querySelectorAll('[data-testid^="postThreadItem-"]')];
  
  posts.forEach((post) => {
    if (post.getAttribute('data-testid')?.startsWith('postThreadItem-')) {
      const shareButton = post.querySelector('[data-testid="shareBtn"]');
      if (shareButton && !post.querySelector(`.${extensionPrefix}bookmark-btn`)) {
        addBookmarkButton(post);
      }
    }
  });
}

function addBookmarkButton(post) {
  const interactionBar = post.querySelector('.css-175oi2r[style*="flex-direction: row; justify-content: space-between; align-items: center;"]');
  if (interactionBar && !interactionBar.querySelector(`.${extensionPrefix}bookmark-btn`)) {
    const bookmarkBtn = createBookmarkButton();
    const lastChild = interactionBar.lastElementChild;
    interactionBar.insertBefore(bookmarkBtn, lastChild);
    updateBookmarkButton(bookmarkBtn, isPostBookmarked(post));
  }
}

function createBookmarkButton() {
  const bookmarkBtnContainer = document.createElement('div');
  bookmarkBtnContainer.className = 'css-175oi2r';
  bookmarkBtnContainer.style.cssText = 'align-items: center;';

  const bookmarkBtn = document.createElement('div');
  bookmarkBtn.className = `${extensionPrefix}bookmark-btn css-175oi2r r-1loqt21 r-1otgn73`;
  bookmarkBtn.setAttribute('aria-label', 'Bookmark');
  bookmarkBtn.setAttribute('tabindex', '0');
  bookmarkBtn.style.cssText = 'gap: 4px; border-radius: 999px; flex-direction: row; justify-content: center; align-items: center; overflow: hidden; padding: 5px;';
  bookmarkBtn.innerHTML = `
    <svg fill="none" width="22" viewBox="0 0 24 24" height="22" style="color: rgb(120, 142, 165); pointer-events: none;">
      <path fill="currentColor" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
    </svg>
  `;

  bookmarkBtnContainer.appendChild(bookmarkBtn);
  return bookmarkBtnContainer;
}

function handleBookmarkClick(event) {
  const bookmarkBtn = event.target.closest(`.${extensionPrefix}bookmark-btn`);
  if (!bookmarkBtn) return;

  event.preventDefault();
  event.stopPropagation();

  const post = bookmarkBtn.closest('[data-testid^="postThreadItem-"]');
  toggleBookmark(post, bookmarkBtn);
}

function toggleBookmark(post, bookmarkBtn) {
  if (!isExtensionContextValid()) {
    console.error('Extension context invalidated. Please refresh the page.');
    showToast('Extension error. Please refresh the page.');
    return;
  }

  const postOptionsBtn = post.querySelector('[data-testid="postDropdownBtn"]');
  if (!postOptionsBtn) {
    console.error('Post options button not found.');
    showToast('Error: Could not find post options.');
    return;
  }

  postOptionsBtn.click();

  setTimeout(() => {
    const embedOption = document.querySelector('[data-testid="postDropdownEmbedBtn"]');
    if (embedOption) {
      embedOption.click();
      setTimeout(() => handleEmbedOrShare(post, bookmarkBtn), 500);
    } else {
      showToast("Bookmarking is only available for posts with embed enabled.");
      closeShareDialog();
    }
  }, 500);
}

function handleEmbedOrShare(post, bookmarkBtn) {
  const embedInput = document.querySelector('input[placeholder="Embed HTML code"]');
  if (embedInput) {
    getEmbedCode(post, bookmarkBtn);
    return;
  }

  showToast("Bookmarking is only available for posts with embed enabled.");
  closeShareDialog();
}

function getEmbedCode(post, bookmarkBtn) {
  const embedInput = document.querySelector('input[placeholder="Embed HTML code"]');
  if (embedInput) {
    const embedCode = embedInput.value;
    const postUrl = getPostUrl(post);

    if (embedCode && postUrl) {
      const bookmarkData = {
        embedCode: embedCode,
        date: new Date().toISOString(),
        url: postUrl
      };

      saveBookmark(bookmarkData, post, bookmarkBtn);
    } else {
      console.error('Embed code or post URL is undefined.');
      showToast('Error: Could not get post data.');
      closeShareDialog();
    }
  } else {
    console.error('Embed input not found.');
    showToast('Error: Could not find post data.');
    closeShareDialog();
  }
}

function getPostLink(post, bookmarkBtn) {
  navigator.clipboard.readText()
    .then(text => {
      if (text.startsWith('https://bsky.app/')) {
        const bookmarkData = {
          url: text,
          date: new Date().toISOString(),
          content: post.querySelector('[data-testid="postContent"]')?.textContent || 'No content available',
          authorName: post.querySelector('[data-testid="profileName"]')?.textContent || 'Unknown User',
          authorHandle: post.querySelector('[data-testid="profileHandle"]')?.textContent || '@unknown'
        };
        saveBookmark(bookmarkData, post, bookmarkBtn);
      } else {
        console.error('Clipboard does not contain a valid Bluesky URL');
        showToast('Error: Could not get post link.');
        closeShareDialog();
      }
    })
    .catch(err => {
      console.error('Failed to read clipboard contents: ', err);
      showToast('Error: Could not get post link.');
      closeShareDialog();
    });
}

function saveBookmark(bookmarkData, post, bookmarkBtn) {
  if (!bookmarkData || !bookmarkData.url) {
    console.error('Invalid bookmark data');
    showToast('Error: Could not save bookmark.');
    closeShareDialog();
    return;
  }

  chrome.runtime.sendMessage({ action: "getBookmarks" }, (bookmarks) => {
    if (chrome.runtime.lastError) {
      console.error('Error getting bookmarks:', chrome.runtime.lastError);
      showToast('Error retrieving bookmarks. Please refresh the page.');
      closeShareDialog();
      return;
    }

    const updatedBookmarks = { ...bookmarks };
    const postUrl = bookmarkData.url;

    if (isPostBookmarked(post)) {
      delete updatedBookmarks[postUrl];
      showToast('Bookmark removed');
    } else {
      updatedBookmarks[postUrl] = bookmarkData;
      showToast('Bookmark added');
    }

    chrome.runtime.sendMessage({ action: "setBookmarks", bookmarks: updatedBookmarks }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error setting bookmarks:', chrome.runtime.lastError);
        showToast('Error saving bookmark. Please refresh the page.');
        closeShareDialog();
        return;
      }
      if (response && response.success) {
        localBookmarks = updatedBookmarks;
        updateBookmarkButton(bookmarkBtn, updatedBookmarks[postUrl] !== undefined);
      } else {
        showToast('Error saving bookmark. Please try again.');
      }
      closeShareDialog();
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

function isPostBookmarked(post) {
  const postUrl = getPostUrl(post);
  return Object.values(localBookmarks).some(bookmark => bookmark.url === postUrl);
}

function getPostUrl(post) {
  const authorHandle = post.querySelector('a[href^="/profile/"]')?.getAttribute('href')?.split('/').pop();
  const postId = post.getAttribute('data-testid').split('-')[1];
  if (authorHandle && postId) {
    return `https://bsky.app/profile/${authorHandle}/post/${postId}`;
  } else {
    console.error('Could not construct post URL');
    return null;
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = `${extensionPrefix}toast`;
  toast.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background-color: #333; color: #fff; padding: 10px 20px; border-radius: 5px; z-index: 10000;';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function addBookmarksMenuItem() {
  if (!isExtensionContextValid()) return;
  const sidebarNav = document.querySelector('.css-175oi2r.r-c4unlt.r-pgf20v.r-1rnoaur.r-1xcajam.r-1ki14p2.r-1w88a7h');
  if (sidebarNav && !document.querySelector('#bookmarks-menu-item')) {
    const bookmarksMenuItem = createBookmarksMenuItem();
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

function closeShareDialog() {
  const closeButtonSelectors = [
    'button[aria-label="Close active dialog"]',
    'button[aria-label="Close"]',
    '[data-testid="closeButton"]',
    'button[aria-label="Close dialog"]'
  ];

  for (let selector of closeButtonSelectors) {
    const closeButton = document.querySelector(selector);
    if (closeButton) {
      closeButton.click();
      console.log(`Clicked close button: ${selector}`);
      return;
    }
  }

  const dialogs = document.querySelectorAll('[role="dialog"], [role="menu"]');
  if (dialogs.length > 0) {
    console.log('No close button found. Attempting to close dialogs by clicking outside.');
    document.body.click();
    return;
  }

  console.log('No dialogs or close buttons found to close.');
}

// Initialize the extension
initializeExtension();
