document.addEventListener('DOMContentLoaded', function() {
  const bookmarksContainer = document.querySelector('.bookmarks-container');
  const openBookmarksBtn = document.getElementById('open-bookmarks');

  // Fetch and display bookmarks
  chrome.storage.sync.get('bookmarks', function(data) {
    const bookmarks = data.bookmarks || {};
    if (Object.keys(bookmarks).length === 0) {
      bookmarksContainer.innerHTML = '<p>No bookmarks yet.</p>';
    } else {
      bookmarksContainer.innerHTML = Object.entries(bookmarks)
        .map(([url, data]) => `
          <div class="bookmark">
            <div class="embed-container">${data.embedCode}</div>
          </div>
        `)
        .join('');
    }

    // Initialize embeds
    initializeEmbeds();
  });

  // Open bookmarks page
  openBookmarksBtn.addEventListener('click', function() {
    chrome.tabs.create({url: 'bookmarks.html'});
  });

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
});
