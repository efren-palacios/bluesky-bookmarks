document.addEventListener('DOMContentLoaded', () => {
  const bookmarksList = document.getElementById('bookmarks-list');

  function renderBookmarks() {
    chrome.storage.sync.get('bookmarks', ({ bookmarks = {} }) => {
      bookmarksList.innerHTML = ''; // Clear existing bookmarks
      Object.entries(bookmarks).forEach(([id, data]) => {
        const bookmarkElement = document.createElement('div');
        bookmarkElement.className = 'bookmark-item';
        bookmarkElement.innerHTML = `
          <div class="css-175oi2r" data-testid="postThreadItem">
            <div class="css-175oi2r" style="padding-left: 16px; padding-right: 16px; border-color: rgb(46, 64, 82); padding-top: 16px;">
              <div class="css-175oi2r" style="flex-direction: row; gap: 12px; padding-bottom: 12px;">
                <div class="css-175oi2r" style="flex-shrink: 1;">
                  <div class="css-175oi2r" style="flex-shrink: 1;">
                    <div class="css-175oi2r" style="width: 42px; height: 42px;">
                      <div class="css-175oi2r r-1mlwlqe r-1udh08x r-417010" style="width: 42px; height: 42px; border-radius: 21px; background-color: rgb(30, 41, 54);">
                        <img alt="" src="${data.avatar || ''}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 21px;">
                      </div>
                    </div>
                  </div>
                </div>
                <div class="css-175oi2r" style="flex: 1 1 0%;">
                  <div class="css-175oi2r">
                    <div dir="auto" class="css-146c3p1 r-1xnzce8" style="font-size: 15px; font-weight: 600; color: rgb(241, 243, 245); line-height: 20px;">
                      ${data.displayName || 'Unknown User'}
                    </div>
                    <div dir="auto" class="css-146c3p1" style="font-size: 15px; color: rgb(174, 187, 201); line-height: 20px;">
                      @${data.handle || 'unknown'}
                    </div>
                  </div>
                </div>
              </div>
              <div class="css-175oi2r" style="padding-bottom: 8px;">
                <div class="css-175oi2r">
                  <div dir="auto" data-word-wrap="1" class="css-146c3p1 r-1xnzce8" style="font-size: 18.75px; color: rgb(241, 243, 245); line-height: 24px; flex: 1 1 0%;">
                    ${data.content}
                  </div>
                </div>
              </div>
              <div class="css-175oi2r" style="flex-flow: wrap; align-items: center; gap: 8px; padding-top: 12px;">
                <div dir="auto" class="css-146c3p1" style="font-size: 13.125px; color: rgb(174, 187, 201); line-height: 13.125px;">
                  Bookmarked on: ${new Date(data.date).toLocaleString()}
                </div>
              </div>
              <div class="bookmark-actions">
                <button class="go-to-post-btn" data-url="${data.url}">
                  <svg fill="none" width="22" viewBox="0 0 24 24" height="22">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  Go to Post
                </button>
                <button class="unbookmark-btn" data-id="${id}">
                  <svg fill="none" width="22" viewBox="0 0 24 24" height="22">
                    <path fill="currentColor" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                  </svg>
                  Unbookmark
                </button>
              </div>
            </div>
          </div>
        `;
        bookmarksList.appendChild(bookmarkElement);
      });

      // Add event listeners to unbookmark buttons
      document.querySelectorAll('.unbookmark-btn').forEach(btn => {
        btn.addEventListener('click', handleUnbookmark);
      });

      // Add event listeners to go-to-post buttons
      document.querySelectorAll('.go-to-post-btn').forEach(btn => {
        btn.addEventListener('click', handleGoToPost);
      });
    });
  }

  function handleUnbookmark(event) {
    const postId = event.currentTarget.getAttribute('data-id');
    chrome.storage.sync.get('bookmarks', ({ bookmarks = {} }) => {
      delete bookmarks[postId];
      chrome.storage.sync.set({ bookmarks }, () => {
        renderBookmarks(); // Re-render the bookmarks list
        showToast('Bookmark removed');
      });
    });
  }

  function handleGoToPost(event) {
    const url = event.currentTarget.getAttribute('data-url');
    window.open(url, '_blank');
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  renderBookmarks();
});
