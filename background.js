chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openBookmarksPage") {
    chrome.tabs.create({ url: chrome.runtime.getURL("bookmarks.html") });
  } else if (request.action === "getBookmarks") {
    chrome.storage.sync.get('bookmarks', (result) => {
      sendResponse(result.bookmarks || {});
    });
    return true; // Indicates that the response is asynchronous
  } else if (request.action === "setBookmarks") {
    chrome.storage.sync.set({ bookmarks: request.bookmarks }, () => {
      sendResponse({ success: true });
    });
    return true; // Indicates that the response is asynchronous
  } else if (request.action === "getCurrentTabId") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        sendResponse(tabs[0].id);
      } else {
        sendResponse(null);
      }
    });
    return true; // Indicates that the response is asynchronous
  } else if (request.action === "fetchEmbedData") {
    fetch(request.url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text(); // Get the response as text first
      })
      .then(text => {
        try {
          return JSON.parse(text); // Try to parse it as JSON
        } catch (e) {
          // If it's not JSON, it's probably an error message
          throw new Error(text);
        }
      })
      .then(data => sendResponse({ success: true, data: data }))
      .catch(error => sendResponse({ success: false, error: error.toString() }));
    return true; // Indicates that the response is asynchronous
  }
});
