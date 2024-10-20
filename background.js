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
  }
});
