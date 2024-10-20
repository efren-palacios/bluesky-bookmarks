document.addEventListener('DOMContentLoaded', () => {
  const bookmarksContainer = document.getElementById('bookmarks-container');
  const clearBookmarksBtn = document.getElementById('clear-bookmarks');

  function displayBookmarks() {
    chrome.storage.sync.get('bookmarks', ({ bookmarks = {} }) => {
      bookmarksContainer.innerHTML = '';
      Object.entries(bookmarks).forEach(([id, data]) => {
        const bookmarkElement = document.createElement('div');
        bookmarkElement.className = 'bookmark';
        bookmarkElement.innerHTML = `
          <p>${data.content}</p>
          <small>Bookmarked on: ${new Date(data.date).toLocaleString()}</small>
        `;
        bookmarksContainer.appendChild(bookmarkElement);
      });
    });
  }

  clearBookmarksBtn.addEventListener('click', () => {
    chrome.storage.sync.set({ bookmarks: {} }, () => {
      displayBookmarks();
    });
  });

  displayBookmarks();
});
