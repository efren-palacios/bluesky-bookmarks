# Bluesky Bookmarker Chrome Extension

![Bluesky Bookmarker Icon](images/icon128.png)

## Overview

Bluesky Bookmarker is a Chrome extension that allows users to bookmark posts on the Bluesky social media platform. Users can easily save interesting posts, view their bookmarks, and manage them through a convenient interface.

## Features

- Bookmark Bluesky posts with a single click
- View bookmarked posts in a popup window
- Manage bookmarks on a dedicated bookmarks page
- Go directly to bookmarked posts
- Remove bookmarks as needed

## Project Structure

- `manifest.json`: Configuration file for the Chrome extension
- `popup.html`: HTML for the extension's popup
- `popup.js`: JavaScript for the popup functionality
- `popup.css`: Styles for the popup
- `content.js`: Content script that runs on Bluesky pages
- `background.js`: Background script for handling extension events
- `bookmarks.html`: HTML for the full bookmarks page
- `bookmarks.js`: JavaScript for the full bookmarks page functionality
- `styles.css`: Shared styles for the extension

## Installation

1. Clone this repository or download the source code.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Usage

1. Navigate to https://bsky.app.
2. Click the Bluesky Bookmarker extension icon to view your bookmarks in a popup.
3. On any Bluesky post, click the bookmark icon to save or remove a bookmark.
4. Click "View All Bookmarks" in the popup to open the full bookmarks page.

## File Descriptions

### manifest.json
Defines the extension's properties, permissions, and scripts.

### popup.html
The HTML structure for the extension's popup, displaying a list of bookmarks and a button to view all bookmarks.

### popup.js
Handles the functionality of the popup, including fetching and displaying bookmarks, and opening the full bookmarks page.

### popup.css
Styles the popup for a clean and user-friendly interface.

### content.js
Injects the bookmark functionality into Bluesky pages, including adding bookmark buttons to posts and handling bookmark actions.

### background.js
Manages background tasks such as opening the bookmarks page and handling storage operations.

### bookmarks.html
The HTML structure for the full bookmarks page, displaying all saved bookmarks.

### bookmarks.js
Manages the functionality of the full bookmarks page, including rendering bookmarks, handling unbookmark actions, and opening bookmarked posts.

### styles.css
Contains shared styles for the extension, including styles for bookmark buttons, toasts, and the bookmarks page.

## Development

To modify the extension:

1. Make changes to the relevant files.
2. If you modify `manifest.json`, you may need to reload the extension in Chrome.
3. For changes to other files, you can usually just refresh the Bluesky page.

## Troubleshooting

- If bookmarks aren't appearing, check the console for any error messages.
- Ensure that the extension has the necessary permissions to access Bluesky pages.
- If changes aren't reflected, try hard refreshing the page or reloading the extension.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)
