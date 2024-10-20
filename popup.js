document.addEventListener('DOMContentLoaded', () => {
  const bookmarksContainer = document.querySelector('.bookmarks-container');
  const openBookmarksBtn = document.getElementById('open-bookmarks');

  // Fetch and display bookmarks
  chrome.storage.sync.get('bookmarks', ({ bookmarks = {} }) => {
    if (Object.keys(bookmarks).length === 0) {
      bookmarksContainer.innerHTML = '<p>No bookmarks yet.</p>';
    } else {
      bookmarksContainer.innerHTML = Object.entries(bookmarks)
        .map(([id, data]) => `
          <div class="bookmark">
            <p>${data.content}</p>
            <small>Bookmarked on: ${new Date(data.date).toLocaleString()}</small>
            <a href="${data.url}" target="_blank" class="post-link">Go to Post</a>
          </div>
        `)
        .join('');
    }
  });

  // Open bookmarks page
  if (openBookmarksBtn) {
    openBookmarksBtn.addEventListener('click', () => {
      chrome.tabs.create({url: 'bookmarks.html'});
    });
  } else {
    console.warn("'View All Bookmarks' button not found in popup.html");
  }
});
