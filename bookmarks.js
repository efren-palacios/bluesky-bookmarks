document.addEventListener('DOMContentLoaded', () => {
  const bookmarksList = document.getElementById('bookmarks-list');
  const sortSelect = document.getElementById('sort-select');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const noBookmarksMessage = document.getElementById('no-bookmarks-message');
  const bookmarksControls = document.getElementById('bookmarks-controls');

  function renderBookmarks(bookmarks, sortOrder) {
    const sortedBookmarks = Object.entries(bookmarks).sort((a, b) => {
      const dateA = new Date(a[1].date);
      const dateB = new Date(b[1].date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    bookmarksList.innerHTML = ''; // Clear existing bookmarks

    if (sortedBookmarks.length === 0) {
      noBookmarksMessage.style.display = 'block';
      bookmarksControls.style.display = 'none';
    } else {
      noBookmarksMessage.style.display = 'none';
      bookmarksControls.style.display = 'flex';

      sortedBookmarks.forEach(([id, data]) => {
        const bookmarkElement = document.createElement('div');
        bookmarkElement.className = 'bookmark-item';
        
        // Create a container for the embed code
        const embedContainer = document.createElement('div');
        embedContainer.className = 'embed-container';
        embedContainer.innerHTML = data.embedCode;

        // Create a container for the remove bookmark button
        const actionContainer = document.createElement('div');
        actionContainer.className = 'bookmark-actions';
        
        // Create the remove bookmark button
        const removeBookmarkBtn = document.createElement('button');
        removeBookmarkBtn.className = 'remove-bookmark-btn';
        removeBookmarkBtn.setAttribute('data-id', id);
        removeBookmarkBtn.innerHTML = `
          <svg fill="none" width="22" viewBox="0 0 24 24" height="22">
            <path fill="currentColor" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
          Remove Bookmark
        `;

        // Append elements
        actionContainer.appendChild(removeBookmarkBtn);
        bookmarkElement.appendChild(embedContainer);
        bookmarkElement.appendChild(actionContainer);
        bookmarksList.appendChild(bookmarkElement);
      });

      // Add event listeners to remove bookmark buttons
      document.querySelectorAll('.remove-bookmark-btn').forEach(btn => {
        btn.addEventListener('click', handleRemoveBookmark);
      });

      // Initialize embeds
      initializeEmbeds();
    }
  }

  function loadAndRenderBookmarks(sortOrder) {
    chrome.storage.sync.get('bookmarks', ({ bookmarks = {} }) => {
      renderBookmarks(bookmarks, sortOrder);
    });
  }

  sortSelect.addEventListener('change', function() {
    loadAndRenderBookmarks(this.value);
  });

  function handleRemoveBookmark(event) {
    const postId = event.currentTarget.getAttribute('data-id');
    chrome.storage.sync.get('bookmarks', ({ bookmarks = {} }) => {
      delete bookmarks[postId];
      chrome.storage.sync.set({ bookmarks }, () => {
        loadAndRenderBookmarks(sortSelect.value); // Re-render the bookmarks list
        showToast('Bookmark removed');
      });
    });
  }

  clearAllBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to remove all bookmarks?')) {
      chrome.storage.sync.set({ bookmarks: {} }, () => {
        loadAndRenderBookmarks(sortSelect.value);
        showToast('All bookmarks cleared');
      });
    }
  });

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function initializeEmbeds() {
    const EMBED_URL = 'https://embed.bsky.app';

    window.addEventListener('message', function (event) {
      if (event.origin !== EMBED_URL) {
        return;
      }
      const id = event.data.id;
      if (!id) {
        return;
      }
      const embed = document.querySelector(`[data-bluesky-id="${id}"]`);
      if (!embed) {
        return;
      }
      const height = event.data.height;
      if (height) {
        embed.style.height = `${height}px`;
      }
    });

    const embeds = document.querySelectorAll('[data-bluesky-uri]');
    embeds.forEach((embed, index) => {
      const id = `embed-${index}`;
      const aturi = embed.getAttribute('data-bluesky-uri');
      if (!aturi) {
        return;
      }

      const ref_url = location.origin + location.pathname;
      const searchParams = new URLSearchParams();
      searchParams.set('id', id);
      if (ref_url.startsWith('http')) {
        searchParams.set('ref_url', encodeURIComponent(ref_url));
      }

      const iframe = document.createElement('iframe');
      iframe.setAttribute('data-bluesky-id', id);
      iframe.src = `${EMBED_URL}/embed/${aturi.slice('at://'.length)}?${searchParams.toString()}`;
      iframe.width = '100%';
      iframe.style.border = 'none';
      iframe.style.display = 'block';
      iframe.style.flexGrow = '1';
      iframe.frameBorder = '0';
      iframe.scrolling = 'no';

      const container = document.createElement('div');
      container.style.maxWidth = '600px';
      container.style.width = '100%';
      container.style.marginTop = '10px';
      container.style.marginBottom = '10px';
      container.style.display = 'flex';
      container.className = 'bluesky-embed';
      container.appendChild(iframe);

      embed.replaceWith(container);
    });
  }

  // Initial load
  loadAndRenderBookmarks('newest');
});
